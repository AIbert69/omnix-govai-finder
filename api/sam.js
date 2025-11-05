export default async function handler(req, res) {
  try {
    const SAM_API_KEY = process.env.SAM_API_KEY; // from Vercel → Environment Variables
    if (!SAM_API_KEY) {
      return res.status(500).json({ error: "Missing SAM_API_KEY" });
    }

    // Read filters from URL (example: ?q=robotics&postedFrom=10/01/2025&postedTo=11/05/2025)
    const {
      q = "robotics",
      postedFrom = "10/01/2025",
      postedTo = "11/05/2025",
      limit = "5",
      offset = "0",
      naics = "541330"
    } = req.query;

    // Validate date format
    const dateRx = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRx.test(postedFrom) || !dateRx.test(postedTo)) {
      return res.status(400).json({ error: "Dates must be in MM/dd/yyyy format" });
    }

    // Build query
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

    const response = await fetch(url, { headers: { Accept: "application/json" } });
    const text = await response.text();

    // Try parsing as JSON
    try {
      const json = JSON.parse(text);
      if (!response.ok) return res.status(response.status).json(json);
      return res.status(200).json(json);
    } catch {
      return res.status(500).json({
        error: "SAM.gov returned non-JSON data",
        body: text.slice(0, 500)
      });
    }
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
