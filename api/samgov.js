// api/samgov.js — Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const SAM_API_KEY = process.env.SAM_API_KEY;
  if (!SAM_API_KEY) {
    return res.status(500).json({ error: 'Missing SAM_API_KEY on server' });
  }

  const { keyword, naics = [], days = 90, limit = 100, page = 0, sort = '-modifiedDate', minCeiling = 0 } = req.body || {};

  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - Number(days || 90));

  const postedFrom = toISO(from);
  const postedTo = toISO(today);

  try {
    const qs = new URLSearchParams();
    if (keyword) qs.set('q', keyword);
    if (Array.isArray(naics) && naics.length) qs.set('naics', naics.join(','));
    qs.set('postedFrom', postedFrom);
    qs.set('postedTo', postedTo);
    qs.set('limit', String(clampInt(Number(limit), 1, 200)));
    qs.set('offset', String(Number(page || 0) * Number(limit || 100)));
    qs.set('sort', sort || '-modifiedDate');
    if (Number(minCeiling) > 0) qs.set('minCeiling', String(minCeiling));

    const url = `https://api.sam.gov/prod/opportunities/v2/search?${qs.toString()}`;

    const r = await fetch(url, {
      method: 'GET',
      headers: { accept: 'application/json', 'x-api-key': SAM_API_KEY }
    });

    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return res.status(r.status).json({ error: `SAM.gov ${r.status}`, detail: text });
    }

    const data = await r.json();
    const rows = data?.opportunitiesData || data?.data || data?.results || data?.items || [];
    const mapped = rows.map(normalize).filter(x => !!x.uiLink);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ results: mapped });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server_error', detail: String(err?.message || err) });
  }
}

function clampInt(n, min, max){ return Math.min(Math.max(Math.floor(n), min), max); }
function toISO(d){ return d.toISOString().slice(0,10); }

function normalize(rec) {
  const id = rec?.noticeId || rec?.id || rec?.oppId || '';
  const uiLink = rec?.uiLink || (id ? `https://sam.gov/opp/${id}/view` : '');
  const postedRaw = rec?.postedDate || rec?.publishDate || rec?.publishedDate || rec?.postDate || '';
  const dueRaw = rec?.responseDeadline || rec?.responseDue || rec?.closeDate || rec?.dueDate || '';

  const posted = postedRaw ? new Date(postedRaw).toISOString().slice(0,10) : '';
  const deadline = dueRaw ? new Date(dueRaw).toISOString().slice(0,10) : '';

  return {
    title: (rec?.title || rec?.description?.title || '').trim(),
    agency: (rec?.agency || rec?.organizationName || rec?.department || '').trim(),
    posted,
    deadline,
    value: (rec?.estimatedValue || rec?.ceiling || rec?.awardCeiling || '').toString(),
    naics: (rec?.naicsCode || rec?.primaryNaics || '').toString(),
    setAside: (rec?.setAside || rec?.setAsideType || '').toString(),
    noticeType: (rec?.noticeType || rec?.type || '').toString(),
    solicitationNumber: (rec?.solicitationNumber || rec?.noticeId || id || '').toString(),
    uiLink
  };
}
