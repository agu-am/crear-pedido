# Pedidos Paul

Sistema de pedidos por WhatsApp para una tienda WooCommerce. Frontend React + Vite, backend = WooCommerce (Hostinger) con un **proxy Node/Express** intermedio que mantiene las credenciales de WooCommerce fuera del navegador.

```
React (Vercel/Hostinger)  →  Proxy Node (Hostinger, /server)  →  WooCommerce REST API
```

## Estructura

- `src/` — Aplicación React (Vite).
- `server/` — API proxy Node/Express para Hostinger. Guarda `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET` **solo en el servidor**.
- `vercel.json` — Rewrites para SPA (si el frontend se despliega en Vercel).

## Requisitos

- Node 18+ (server).
- En WooCommerce (Hostinger):
  - Claves API REST con permiso **Read/Write**: `WooCommerce > Ajustes > Avanzado > API REST`.
  - Plugin **"JWT Authentication for WP REST API"** instalado y activado (necesario para el login). Verificado activo en producción. En `wp-config.php` debe estar configurado:
    ```
    define('JWT_AUTH_SECRET_KEY', 'una-frase-larga-y-aleatoria');
    ```

## Configuración

### 1. Servidor proxy (`server/`)

```bash
cd server
cp .env.example .env
# completar .env
npm install
npm start
```

Variables de `server/.env`:

| Variable             | Descripción |
|----------------------|-------------|
| `PORT`               | Puerto del servidor (Hostinger lo asigna). |
| `WC_URL`             | URL del sitio WooCommerce, sin barra final. |
| `WC_CONSUMER_KEY`    | Clave API de WooCommerce (Read/Write). |
| `WC_CONSUMER_SECRET` | Secreto API de WooCommerce. |
| `JWT_SECRET`         | Secreto para firmar tokens. Generar con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. |
| `CORS_ORIGIN`        | Orígenes del frontend permitidos, separados por coma. |
| `JWT_TOKEN_URL`      | `https://TU-SITIO/wp-json/jwt-auth/v1/token`. |
| `CACHE_TTL`          | Segundos de caché para productos/clientes (por defecto 60). |

Endpoints: `POST /api/login`, `GET /api/me`, `GET /api/productos`, `GET /api/clientes` (públicos de lectura), `GET|POST /api/ordenes`, `POST /api/clientes`, `PUT /api/clientes/:id/telefono` (requieren token).

### 2. Frontend (`VITE_API_URL`)

Copiar `.env.example` → crear `.env`:

```bash
VITE_API_URL=http://localhost:3000        # dev
# En producción:
VITE_API_URL=https://TU-PROXY.dominio.com
```

> `VITE_API_URL` se define **en el build**. No incluir credenciales con prefijo `VITE_` (quedarían visibles en el bundle).

### 3. Login

El proxy valida usuario/contraseña contra el endpoint `jwt-auth` del sitio y emite su **propio token** (firmado con `JWT_SECRET`, expira en 8h). El frontend lo guarda en `localStorage` y lo envía como `Authorization: Bearer`.

> Recomendación de seguridad: migrar a HttpOnly cookie en el mismo dominio del frontend para reducir el riesgo de XSS.

## Deploy en Hostinger

### Proxy Node

1. Subir la carpeta `server/` a un hosting Node de Hostinger (hPanel → Websites → Node.js).
2. En hPanel, definir las variables de entorno (botón "Environment variables") o subir un `.env`.
3. Hostinger detecta `npm start` como comando de arranque; el servidor se maneja con PM2.
4. Verificar el healthcheck: `https://TU-PROXY.dominio.com/api/health` → `{"ok":true}`.

### Frontend

- **Vercel:** conectar el repo, en "Environment Variables" definir `VITE_API_URL` apuntando al proxy y `npm run build` como build.
- **Hostinger:** subir el resultado de `npm run build` (carpeta `dist/`) al `public_html`, y agregar un `.htaccess` con los rewrites SPA (Vite genera una plantilla).

## Seguridad (importante)

1. **Rotá las claves de WooCommerce**: las claves anteriores quedaron expuestas en el bundle JS del frontend y en el historial de git. Regenerar en `WooCommerce > Ajustes > Avanzado > API REST` y actualizar `server/.env`.
2. **No versionar secretos**: `.env` está en `.gitignore`. Si `.env` quedó commiteado en el historial, limpiarlo con `git filter-repo` o BFG Repo-Cleaner, o crear un repo nuevo.
3. **Limitar `/wp-json/wp/v2/users`**: ese endpoint respondió 200 sin autenticación (lista de usuarios pública). Restringir su acceso en el servidor (regla de firewall/apache) o bloquearlo con un plugin de seguridad.
4. El endpoint `GET /api/clientes` es público de lectura (id, nombre, email, teléfono) porque la pantalla de Home lo necesita. Si se requiere, protegerlo con token y moverlo detrás del login.

## Desarrollo

```bash
# Frontend
npm install
npm run dev        # http://localhost:5173

# Proxy (en otra terminal)
cd server
npm install
npm run dev        # http://localhost:3000
```

## Scripts

```bash
npm run dev        # Vite dev server
npm run build      # Build de producción a dist/
npm run lint       # ESLint (max-warnings 0)
npm run preview    # Vista previa del build
```
