export default async function handler(req, res) {
  try {
    const { q = "robotics", postedFrom = "2024-08-01", postedTo = "2024-11-01" } = req.query;

    const response = await fetch(
      `https://api.data.gov/sam/v1/opportunities/search?api_key=${process.env.SAM_API_KEY}&q=${q}&postedFrom=${postedFrom}&postedTo=${postedTo}`
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`SAM.gov API error: ${text}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching SAM.gov data:", err);
    res.status(500).json({ error: err.message });
  }
}

