export default async function handler(req, res) {
  try {
    if (!process.env.SAM_API_KEY) {
      return res.status(500).json({ error: "Missing SAM_API_KEY" });
    }

    const { q = "", naics = "", limit = "100", days, from, to } = req.query;

    // Build date range
    const today = new Date();
    const postedTo = (to ? new Date(to) : today).toISOString().slice(0, 10);
    let postedFrom;
    if (from) {
      postedFrom = new Date(from).toISOString().slice(0, 10);
    } else {
      const lookback = Number.isFinite(+days) ? Math.max(1, parseInt(days, 10)) : 90;
      const d = new Date(today);
      d.setDate(d.getDate() - lookback);
      postedFrom = d.toISOString().slice(0, 10);
    }

    // Build query
    const params = new URLSearchParams({
      api_key: process.env.SAM_API_KEY,
      postedFrom,
      postedTo,
      limit,
      sort: "-publishDate",
    });

    if (q) params.append("q", q);
    if (naics) params.append("naics", naics);

    const url = `https://api.sam.gov/opportunities/v2/search?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error("SAM.gov API Error:", text);
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
