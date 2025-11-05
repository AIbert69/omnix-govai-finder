export default async function handler(req, res) {
  try {
    const r = await fetch("https://api.sam.gov/", { method: "HEAD" });
    return res.status(200).json({
      ok: true,
      samHeadStatus: r.status
    });
  } catch (e) {
    return res.status(502).json({
      ok: false,
      error: "Could not resolve/fetch api.sam.gov",
      details: String(e)
    });
  }
}
