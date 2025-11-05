export default async function handler(req, res) {
  try {
    const { q, naics } = req.query;

    if (!process.env.SAM_API_KEY) {
      return res.status(500).json({ error: "Missing SAM_API_KEY" });
    }

    const url = `https://api.sam.gov/opportunities/v2/search?limit=10&q=${encodeURIComponent(q || "")}&naics=${encodeURIComponent(naics || "")}&api_key=${process.env.SAM_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error("SAM.gov API Error:", text);
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
