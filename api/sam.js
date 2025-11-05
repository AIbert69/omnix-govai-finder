// 1) Correct base URL
const BASE = "https://api.sam.gov/prod/opportunities/v2/search";

export default async function handler(req, res) {
  try {
    const { searchParams } = new URL(req.url, 'http://x'); // node fetch route
    const q           = searchParams.get('q') || '';
    const naics       = searchParams.get('naics') || '';      // "333249,333318" etc.
    const daysBack    = Number(searchParams.get('daysBack') || 90);
    const minCeiling  = searchParams.get('minCeiling') || ''; // dollars
    const limit       = searchParams.get('limit') || '25';

    // 2) Required dates (SAM requires both)
    const to  = new Date();
    const fr  = new Date(to); fr.setDate(fr.getDate() - daysBack);
    const postedFrom = fr.toISOString().slice(0,10); // YYYY-MM-DD
    const postedTo   = to.toISOString().slice(0,10);

    // 3) Build query
    const params = new URLSearchParams({
      api_key: process.env.SAM_API_KEY,   // keep it in env, not code
      postedFrom, postedTo,
      limit,
    });

    if (q)          params.set('q', q);
    if (naics)      params.set('naics', naics);       // comma-separated
    if (minCeiling) params.set('minAwardCeiling', minCeiling);

    const url = `${BASE}?${params.toString()}`;
    const r = await fetch(url, { headers: { Accept: "application/json" } });

    if (!r.ok) {
      const txt = await r.text();
      throw new Error(`SAM.gov API error: ${txt}`);
    }

    const data = await r.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
}
