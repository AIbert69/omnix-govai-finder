// api/sam.js (CommonJS – no warnings)
const BASE = 'https://api.sam.gov/prod/opportunities/v2/search';

module.exports = async (req, res) => {
  try {
    const KEY = process.env.SAM_API_KEY;
    if (!KEY) {
      return res.status(500).json({ error: 'Missing SAM_API_KEY in env' });
    }

    const {
      q = '',
      naics = '',
      postedFrom = '',
      postedTo = '',
      limit = '100',
      minCeiling = ''
    } = req.query || {};

    const qs = new URLSearchParams();
    if (q) qs.set('q', q);
    if (naics) qs.set('naics', naics);
    if (postedFrom) qs.set('postedFrom', postedFrom);
    if (postedTo) qs.set('postedTo', postedTo);
    if (limit) qs.set('limit', limit);
    if (minCeiling) qs.set('minCeiling', minCeiling);

    const url = `${BASE}?${qs.toString()}`;
    const r = await fetch(url, {
      headers: {
        accept: 'application/json',
        'x-api-key': KEY
      }
    });

    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return res.status(r.status).json({ error: `SAM.gov HTTP ${r.status}: ${text}` });
    }

    const data = await r.json();

    const rows =
      data?.opportunitiesData ||
      data?.data ||
      data?.results ||
      data?.items ||
      [];

    const mapped = rows.map((rec) => ({
      title: rec?.title || rec?.description || '',
      agency: rec?.agency || rec?.department || '',
      posted: rec?.postedDate || rec?.posted || rec?.publishDate || '',
      deadline: rec?.responseDate || rec?.closeDate || '',
      value: rec?.ceiling || rec?.estimatedValue || rec?.value || '',
      naics: Array.isArray(rec?.naics) ? rec.naics.join(', ') : (rec?.naics || ''),
      link: rec?.uiLink || rec?.url || ''
    }));

    res.status(200).json({ count: mapped.length, rows: mapped });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Unknown error' });
  }
};
