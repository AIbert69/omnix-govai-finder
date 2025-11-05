export default async function handler(req, res) {
  const SAM_API_KEY = process.env.SAM_API_KEY;
  if (!SAM_API_KEY) {
    return res.status(500).json({ error: "Missing SAM_API_KEY" });
  }

  // Query params with defaults
  const {
    q = "robotics",
    postedFrom = "10/01/2025",
    postedTo   = "11/05/2025",
    limit      = "5",
    offset     = "0",
    naics      = "541330"
  } = req.query;

  // Validate MM/dd/yyyy
  const dateRx = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateRx.test(postedFrom) || !dateRx.test(postedTo)) {
    return res.status(400).json({ error: "Dates must be in MM/dd/yyyy format" });
  }

  const params = new URLSearchParams({
    api_key: SAM_API_KEY,
    postedFrom,
    postedTo,
    limit,
    offset,
    q,
    naics,
    sort: "postedDate,desc"
  });

  const url = `https://api.sam.gov/prod/opportunities/v2/search?${params.toString()}`;

  // Simple retry on transient DNS/TLS failures
  const maxAttempts = 3;
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 15000); // 15s safety

      const response = await fetch(url, {
        signal: ctrl.signal,
        headers: {
          "Accept": "application/json",
          // User-Agent helps some gov endpoints
          "User-Agent": "omnix-govai-finder/1.0 (contact: ops@singhautomation.com)"
        }
      });

      clearTimeout(timeout);
      const text = await response.text();

      // Try JSON parse (SAM sometimes returns text on errors)
      try {
        const json = JSON.parse(text);
        if (!response.ok) return res.status(response.status).json(json);
        return res.status(200).json(json);
      } catch {
        // Non-JSON response from upstream
        return res.status(502).json({
          error: "Upstream returned non-JSON",
          upstreamStatus: response.status,
          bodyPreview: text.slice(0, 500)
        });
      }

    } catch (err) {
      // DNS/ENOTFOUND/Abort — retry a couple times
      if (attempt < maxAttempts) {
        await sleep(500 * attempt);
        continue;
      }
      return res.status(502).json({
        error: "Fetch to SAM.gov failed",
        details: String(err),
        tried: attempt
      });
    }
  }
}

