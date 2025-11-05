const base = 'https://api.sam.gov/opportunities/v2/search';
const url = new URL(base);
url.searchParams.set('api_key', process.env.SAM_API_KEY);
url.searchParams.set('postedFrom', postedFrom); // e.g. '2025-08-01'
url.searchParams.set('postedTo', postedTo);     // e.g. '2025-11-04'
url.searchParams.set('limit', String(limit || 25));
if (keywords) url.searchParams.set('keywords', keywords);
if (naics) url.searchParams.set('naics', naics);

const resp = await fetch(url.toString());
const data = await resp.json();

