# MTG Automotora - Guía de Deployment

Este documento contiene las instrucciones completas para deployar la plataforma MTG Automotora en Cloudflare Pages con D1 y R2.

## 📋 Requisitos Previos

- Cuenta de Cloudflare (las credenciales ya están disponibles)
- Cuenta de GitHub
- Node.js 18+ o Bun instalado localmente

---

## 🚀 Paso 1: Subir a GitHub

El proyecto ya está preparado para subir. Ejecuta los siguientes comandos:

```bash
# Crear un Personal Access Token en GitHub:
# 1. Ve a https://github.com/settings/tokens
# 2. Click "Generate new token (classic)"
# 3. Selecciona permisos: repo, workflow
# 4. Copia el token generado

# Luego, en la terminal:
cd /home/z/my-project

# Configurar el remote con tu token (reemplaza TU_TOKEN)
git remote set-url origin https://TU_TOKEN@github.com/selffene-cyber/mtgzhipu.git

# Push al repositorio
git push -u origin main
```

---

## 🗄️ Paso 2: Crear Base de Datos D1 en Cloudflare

1. **Iniciar sesión en Cloudflare Dashboard**
   - URL: https://dash.cloudflare.com
   - Email: gerencia@mastg.cl
   - Password: mastechgoup2025#

2. **Crear la base de datos D1**
   - Ve a **Workers & Pages** → **D1 SQL Database**
   - Click **Create database**
   - Nombre: `bdmtgzhipu`
   - Click **Create**
   - **Anota el Database ID** que aparece (ej: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

3. **Ejecutar el schema**
   - En la base de datos creada, ve a **Console**
   - Copia el contenido de `prisma/migrations/d1-schema.sql`
   - Pega y ejecuta el SQL
   - Repite con `prisma/migrations/d1-seed.sql` para datos de demo

---

## 📦 Paso 3: Crear Bucket R2

1. **En Cloudflare Dashboard**
   - Ve a **R2 Object Storage**
   - Click **Create bucket**
   - Nombre: `mtgzhipu-files`
   - Click **Create bucket**

2. **Configurar CORS (opcional, para uploads)**
   - Ve a la pestaña **Settings** del bucket
   - Click **Add CORS policy**
   - Agrega:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

---

## 🌐 Paso 4: Crear Proyecto en Cloudflare Pages

1. **Conectar GitHub**
   - Ve a **Workers & Pages** → **Create application**
   - Selecciona **Pages** → **Connect to Git**
   - Autoriza GitHub y selecciona el repositorio `selffene-cyber/mtgzhipu`

2. **Configurar Build**
   - Framework preset: **Next.js**
   - Build command: `npm run pages:build`
   - Build output directory: `.vercel/output/static`
   - Root directory: `/`

3. **Variables de entorno** (Settings → Environment Variables)
   ```
   CF_D1_DATABASE_ID=tu-database-id-aqui
   NEXT_PUBLIC_APP_URL=https://mtgzhipu.pages.dev
   NEXT_PUBLIC_APP_NAME=MTG Automotora
   NEXTAUTH_SECRET=genera-un-string-aleatorio-seguro
   NEXTAUTH_URL=https://mtgzhipu.pages.dev
   WHATSAPP_NUMBER=+56912345678
   ```

4. **Bindings** (Settings → Functions → D1 database bindings)
   - Variable name: `DB`
   - D1 database: `bdmtgzhipu`

5. **R2 Bindings** (Settings → Functions → R2 bucket bindings)
   - Variable name: `BUCKET`
   - R2 bucket: `mtgzhipu-files`

6. **Save and Deploy**

---

## ⚙️ Paso 5: Actualizar wrangler.toml

Después de crear la base de datos D1, actualiza el archivo `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "bdmtgzhipu"
database_id = "TU_DATABASE_ID_REAL_AQUI"
```

Haz commit y push del cambio:
```bash
git add wrangler.toml
git commit -m "Update D1 database ID"
git push
```

---

## 🔐 Credenciales de Demo

### Administrador
- Email: `admin@mtg.cl`
- Password: `admin123`

### Vendedor
- Email: `ventas@mtg.cl`
- Password: `ventas123`

---

## 📁 Estructura del Proyecto

```
mtgzhipu/
├── prisma/
│   ├── schema.prisma          # Schema de Prisma (desarrollo local)
│   ├── seed.ts                # Script de seed local
│   └── migrations/
│       ├── d1-schema.sql      # Schema para D1
│       └── d1-seed.sql        # Datos demo para D1
├── src/
│   ├── app/
│   │   ├── admin/             # Panel de administración
│   │   ├── api/               # API routes
│   │   ├── catalogo/          # Catálogo público
│   │   ├── vendedor/          # Portal de vendedor
│   │   └── ...
│   ├── components/
│   │   ├── layout/            # Componentes de layout
│   │   └── ui/                # Componentes shadcn/ui
│   └── lib/
│       ├── db.ts              # Cliente Prisma (SQLite local)
│       ├── db-d1.ts           # Adaptador D1
│       └── api-utils.ts       # Utilidades API
├── wrangler.toml              # Configuración Cloudflare
└── package.json
```

---

## 🛠️ Comandos Útiles

### Desarrollo Local
```bash
bun run dev          # Iniciar servidor de desarrollo
bun run db:push      # Crear/actualizar schema local
bun run db:seed      # Poblar datos demo
bun run lint         # Verificar código
```

### Cloudflare
```bash
bun run pages:build  # Build para Cloudflare Pages
bun run pages:dev    # Servidor local de Cloudflare
```

---

## ❓ Solución de Problemas

### Error: "D1 database not found"
- Verifica que el binding `DB` esté configurado en Cloudflare Pages
- Confirma que el database_id en wrangler.toml sea correcto

### Error: "R2 bucket not found"
- Verifica que el binding `BUCKET` esté configurado
- Confirma que el bucket exista en R2

### Build falla en Cloudflare
- Revisa los logs en el dashboard de Cloudflare
- Verifica que todas las dependencias estén en package.json
- Asegúrate de que no haya imports de Node.js específicos

---

## 📞 Soporte

Para problemas o consultas:
- Revisar los logs en Cloudflare Dashboard
- Consultar la documentación de Next.js y Cloudflare Pages
- Contactar al equipo de desarrollo

---

**¡La plataforma MTG Automotora está lista para producción!** 🚗💨
