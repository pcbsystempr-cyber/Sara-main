module.exports = function handler(req, res) {
  const config = {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    supabaseBucket: process.env.SUPABASE_BUCKET || 'apartment-images'
  };

  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(200).send(`window.__SUPABASE_CONFIG__ = ${JSON.stringify(config)};`);
};
