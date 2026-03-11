function getSiteUrl(req) {
  const configured = process.env.SITE_URL;
  const fallback = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host || 'localhost:3000'}`;

  return (configured || fallback).replace(/\/+$/, '');
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function getApartmentUrls(siteUrl) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return [];

  const response = await fetch(`${supabaseUrl}/rest/v1/apartments?select=id,updated_at&order=id.asc`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase sitemap query failed with ${response.status}`);
  }

  const apartments = await response.json();
  return apartments.map(apartment => ({
    loc: `${siteUrl}/apartment-detail.html?id=${apartment.id}`,
    lastmod: apartment.updated_at || undefined,
    changefreq: 'weekly',
    priority: '0.8'
  }));
}

module.exports = async function handler(req, res) {
  const siteUrl = getSiteUrl(req);
  const urls = [
    { loc: `${siteUrl}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${siteUrl}/listings.html`, changefreq: 'daily', priority: '0.9' },
    { loc: `${siteUrl}/contacto.html`, changefreq: 'monthly', priority: '0.5' }
  ];

  try {
    urls.push(...await getApartmentUrls(siteUrl));
  } catch (error) {
    console.error('Error generating sitemap apartment URLs:', error);
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
${url.lastmod ? `    <lastmod>${escapeXml(new Date(url.lastmod).toISOString())}</lastmod>
` : ''}${url.changefreq ? `    <changefreq>${url.changefreq}</changefreq>
` : ''}${url.priority ? `    <priority>${url.priority}</priority>
` : ''}  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(body);
};