export default async function handler(req, res) {
  try {
    const key = process.env.SAM_API_KEY;
    if (!key) return res.status(500).json({ error: "Missing SAM_API_KEY" });
    const url = new URL("https://api.sam.gov/opportunities/v2/search");
    const params = req.query || {};
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    url.searchParams.set("api_key", key);
    const r = await fetch(url, { headers: { accept: "application/json", "x-api-key": key } });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}