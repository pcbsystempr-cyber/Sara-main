function getSiteUrl(req) {
  const configured = process.env.SITE_URL;
  const fallback = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host || 'localhost:3000'}`;

  return (configured || fallback).replace(/\/+$/, '');
}

module.exports = function handler(req, res) {
  const siteUrl = getSiteUrl(req);
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /dashboard.html',
    'Disallow: /api/',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(body);
};