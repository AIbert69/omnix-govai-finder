// api/key.js — returns a masked version of SAM_API_KEY (****last4)
export default async function handler(req, res) {
  const key = process.env.SAM_API_KEY || '';
  const masked = key ? ('*'.repeat(Math.max(0, key.length - 4)) + key.slice(-4)) : '(not set)';
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(masked);
}
