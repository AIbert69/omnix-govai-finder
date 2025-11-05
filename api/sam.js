// ✅ Omnix GovAI Finder - Fixed SAM.gov API (with correct date format)

export default async function handler(req, res) {
  try {
    // --- STEP 1: Read inputs ---
    const q = req.query.q || "robotics";
    const naics = req.query.naics || "";
    const limit = req.query.limit || "10";
    const daysBack = parseInt(req.query.daysBack || "90", 10);

    // --- STEP 2: Build correct MM/dd/yyyy date range ---
    function formatMMDDYYYY(date) {
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const yyyy = String(date.getFullYear());
      return `${mm}/${dd}/${yyyy}`;
    }

    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - daysBack);

    const postedFrom = formatMMDDYYYY(from);
    const postedTo = formatMMDDYYYY(today);

    // --- STEP 3: Build the SAM.gov URL ---
    const base = "https://api.sam.gov/prod/opportunities/v2/search";
    const params = new URLSearchParams({
      api_key: process.env.SAM_API_KEY, // use your Vercel env key
      q,
      limit,
      postedFrom,
      postedTo,
    });
    if (naics) params.append("naics", naics);

    const url = `${base}?${params.toString()}`;

    // --- STEP 4: Call SAM.gov ---
    const response = await fetch(url);
    const text = await response.text();

    // --- STEP 5: Try to parse JSON or return clean error ---
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: "SAM.gov returned unexpected data",
        snippet: text.slice(0, 300),
      });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
