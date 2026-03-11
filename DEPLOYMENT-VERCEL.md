## Deployment exacto: Supabase + Vercel

### 1. Preparar Supabase
1. Crea un proyecto nuevo en Supabase.
2. Abre `SQL Editor`.
3. Copia y ejecuta completo el archivo `supabase-setup.sql`.
4. Verifica que existan:
   - tabla `apartments`
   - tabla `rental_inquiries`
   - tabla `admins`
   - bucket `apartment-images`

### 2. Crear el usuario administrador
1. Ve a `Authentication` → `Users`.
2. Crea un usuario con email y contraseña.
3. Marca el usuario como confirmado si Supabase lo solicita.
4. Copia el `UUID` del usuario creado.
5. Vuelve a `SQL Editor` y ejecuta:

   insert into public.admins (user_id)
   values ('PEGA_AQUI_EL_UUID_DEL_USUARIO');

### 3. Obtener las variables públicas
En `Project Settings` → `API`, copia:
- `Project URL`
- `anon public key`

Usarás estos nombres exactos en Vercel:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_BUCKET` = `apartment-images`
- `SITE_URL` = la URL pública final, por ejemplo `https://tu-dominio.com` o `https://tu-proyecto.vercel.app`

### 4. Subir el proyecto a GitHub
1. Sube esta carpeta completa a un repositorio GitHub.
2. Asegúrate de incluir:
   - `api/config.js`
   - `supabase-api.js`
   - `supabase-setup.sql`
   - todos los `.html`, `.js`, `.css`
   - la carpeta `images`

### 5. Crear el proyecto en Vercel
1. Entra en Vercel.
2. Pulsa `Add New...` → `Project`.
3. Importa el repositorio GitHub.
4. Configura así:
   - `Framework Preset`: `Other`
   - `Root Directory`: la raíz del proyecto
   - `Build Command`: dejar vacío
   - `Output Directory`: dejar vacío
   - `Install Command`: dejar vacío

### 6. Crear las variables de entorno en Vercel
Antes de desplegar, en la sección `Environment Variables`, crea exactamente estas 4:

- `SUPABASE_URL` = tu Project URL de Supabase
- `SUPABASE_ANON_KEY` = tu anon public key de Supabase
- `SUPABASE_BUCKET` = `apartment-images`
- `SITE_URL` = la URL pública final del sitio, sin `/` al final

Aplica las variables al entorno `Production`, y si quieres también a `Preview` y `Development`.

### 7. Hacer el primer deployment
1. Pulsa `Deploy`.
2. Cuando termine, abre esta URL:

   `https://TU-DOMINIO.vercel.app/api/config.js`

3. Debes ver una respuesta JavaScript parecida a:

   window.__SUPABASE_CONFIG__ = {...};

Si esa URL no responde, el problema está en Vercel y no en Supabase.

4. Abre también:

   - `https://TU-DOMINIO.vercel.app/robots.txt`
   - `https://TU-DOMINIO.vercel.app/sitemap.xml`

5. `robots.txt` debe mostrar la ruta del sitemap, y `sitemap.xml` debe listar al menos la home, listados y las fichas de apartamentos disponibles.

### 8. Checklist obligatorio post-deploy
Verifica estas rutas una por una:

1. `https://TU-DOMINIO.vercel.app/`
   - Debe cargar apartamentos destacados.
2. `https://TU-DOMINIO.vercel.app/listings.html`
   - Debe listar apartamentos desde Supabase.
3. `https://TU-DOMINIO.vercel.app/apartment-detail.html?id=1`
   - Debe abrir la galería del apartamento.
4. `https://TU-DOMINIO.vercel.app/contacto.html?id=1`
   - Debe permitir enviar una solicitud.
5. `https://TU-DOMINIO.vercel.app/dashboard.html`
   - Debe permitir login con el usuario admin de Supabase.
6. `https://TU-DOMINIO.vercel.app/robots.txt`
   - Debe devolver reglas de indexación.
7. `https://TU-DOMINIO.vercel.app/sitemap.xml`
   - Debe devolver el sitemap XML.

### 9. Cómo subir imágenes desde el admin
1. Entra a `dashboard.html`.
2. Inicia sesión con el usuario admin que creaste en Supabase.
3. Agrega o edita un apartamento.
4. Puedes:
   - escribir una URL manual en `URL de Imagen Principal`
   - o subir varias imágenes desde `Seleccionar imágenes de galería`
5. Si no defines imagen principal, la primera imagen subida se usa como portada.
6. Las nuevas imágenes se guardan en el bucket `apartment-images`.

### 10. Si cambias variables en Vercel
Cada vez que cambies `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_BUCKET` o `SITE_URL`:
1. Guarda los cambios.
2. Haz `Redeploy` del proyecto.

### 11. Errores típicos y solución
- `Faltan las variables públicas de Supabase en Vercel`
  - faltan variables de entorno o están vacías.
- `robots.txt` o `sitemap.xml` no muestran la URL correcta
  - revisa que `SITE_URL` esté configurada con la URL pública final y vuelve a hacer `Redeploy`.
- `El usuario existe pero no está registrado en la tabla de administradores`
  - faltó insertar el UUID en `public.admins`.
- no cargan imágenes subidas
  - revisa que el bucket sea `apartment-images` y que ejecutaste `supabase-setup.sql` completo.
- el formulario de contacto no guarda
  - revisa que la tabla `rental_inquiries` exista y que sus políticas estén creadas.

### 12. Orden recomendado para que no falle
Sigue este orden exacto:
1. crear proyecto en Supabase
2. ejecutar `supabase-setup.sql`
3. crear usuario admin
4. insertar UUID en `public.admins`
5. subir repo a GitHub
6. importar repo en Vercel
7. crear variables de entorno en Vercel
8. deploy
9. probar `/api/config.js`
10. probar `/robots.txt` y `/sitemap.xml`
11. probar `dashboard.html`
