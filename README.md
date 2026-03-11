# Vital Stays

Sitio web estático de alquiler de apartamentos conectado a Supabase para:

- listado de apartamentos
- detalle con galería de imágenes
- formulario de solicitudes de alquiler
- panel admin con CRUD y subida de imágenes

## Archivos importantes
- `supabase-api.js`: helper compartido para DB/Auth/Storage
- `api/config.js`: runtime config para Vercel
- `api/robots.txt.js`: robots dinámico para producción
- `api/sitemap.xml.js`: sitemap dinámico con apartamentos desde Supabase
- `supabase-setup.sql`: schema, policies, bucket y seed inicial
- `DEPLOYMENT-VERCEL.md`: pasos exactos de deployment

## Variables de entorno en Vercel
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_BUCKET`
- `SITE_URL`