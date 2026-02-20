# MTG Automotora - Guía de Deployment Completa

Esta guía te llevará paso a paso para configurar el deployment automático desde GitHub a Cloudflare Pages, con acceso a la base de datos D1 desde local.

## 📋 Resumen de Arquitectura

```
┌─────────────────┐     Push      ┌─────────────────┐     Deploy     ┌─────────────────┐
│   Local Dev     │ ────────────▶ │    GitHub       │ ─────────────▶ │ Cloudflare      │
│   (Tu PC)       │               │   (Repo)        │                │ Pages           │
└────────┬────────┘               └─────────────────┘                └────────┬────────┘
         │                                                                    │
         │ Conexión a BD                                                      │
         ▼                                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Cloudflare D1 (bdmtgzhipu)                           │
│                        Cloudflare R2 (mtgzhipu-files)                       │
└─────────────────────────────────────────────────────────────────────────────┘

Producción: https://automotora.mastg.cl
Desarrollo: https://dev.automotora.mastg.cl (opcional)
```

---

## 🚀 FASE 1: Configurar Cloudflare

### Paso 1.1: Login en Cloudflare
```bash
# Ejecutar desde la raíz del proyecto
bun run cf:login
```
Esto abrirá el navegador para autenticarte con las credenciales:
- Email: `gerencia@mastg.cl`
- Password: `mastechgoup2025#`

### Paso 1.2: Crear Base de Datos D1
```bash
# Crear la base de datos
bun run d1:create

# Ver el ID de la base de datos
bun run d1:list

# Copiar el ID y actualizar wrangler.toml
# Reemplazar PLACEHOLDER_D1_DATABASE_ID con el ID real

# Ejecutar el schema
bun run d1:migrate

# Insertar datos de demo
bun run d1:seed
```

### Paso 1.3: Crear Bucket R2
```bash
# Crear el bucket
bun run r2:create

# Verificar
bun run r2:list
```

### Paso 1.4: Crear Proyecto Pages
```bash
# Build inicial
bun run pages:build

# Crear proyecto y deploy
bun run pages:deploy
```

O manualmente desde el Dashboard:
1. Ve a https://dash.cloudflare.com
2. Workers & Pages → Create application → Pages → Connect to Git
3. Selecciona el repositorio `selffene-cyber/mtgzhipu`
4. Configura:
   - Build command: `bun run pages:build`
   - Output directory: `.vercel/output/static`
   - Environment variables: (ver sección abajo)

### Paso 1.5: Configurar Bindings en Pages
En el Dashboard de Cloudflare Pages:
1. Settings → Functions → D1 database bindings
   - Variable name: `DB`
   - D1 database: `bdmtgzhipu`

2. Settings → Functions → R2 bucket bindings
   - Variable name: `BUCKET`
   - R2 bucket: `mtgzhipu-files`

---

## 🌐 FASE 2: Configurar Dominio automotora.mastg.cl

### Paso 2.1: Agregar Dominio Personalizado
1. En Cloudflare Pages → mtgzhipu → Settings → Custom domains
2. Click "Set up a custom domain"
3. Ingresa: `automotora.mastg.cl`
4. Click "Activate domain"

### Paso 2.2: Verificar DNS
Cloudflare creará automáticamente el registro CNAME:
```
automotora CNAME mtgzhipu.pages.dev
```

Si tienes el dominio en otro proveedor, apunta el CNAME a `mtgzhipu.pages.dev`

---

## 🔐 FASE 3: Configurar GitHub para Deployment Automático

### Paso 3.1: Crear Personal Access Token de GitHub
1. Ve a https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Selecciona permisos: `repo` (full control of private repositories)
4. Click "Generate token"
5. **COPIA EL TOKEN** (solo se muestra una vez)

### Paso 3.2: Crear API Token de Cloudflare
1. Ve a https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Usa template "Edit Cloudflare Workers" o crea personalizado con:
   - Account → Cloudflare Pages: Edit
   - Account → D1: Edit
   - Account → Workers R2 Storage: Edit
4. Copia el token

### Paso 3.3: Configurar Secrets en GitHub
1. Ve a https://github.com/selffene-cyber/mtgzhipu/settings/secrets/actions
2. Click "New repository secret" para cada uno:

| Secret | Valor |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | Token creado en paso 3.2 |
| `CLOUDFLARE_ACCOUNT_ID` | Tu Account ID de Cloudflare (lo ves en el dashboard) |

### Paso 3.4: Variables de Entorno (Opcional)
En la misma sección, agrega Variables:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_APP_NAME` | MTG Automotora |
| `NEXT_PUBLIC_APP_URL` | https://automotora.mastg.cl |

---

## 💻 FASE 4: Desarrollo Local conectado a D1

### Opción A: Desarrollo con SQLite Local
```bash
# Desarrollo normal (usa SQLite local)
bun run dev

# La BD local está en: db/custom.db
```

### Opción B: Desarrollo con D1 Remoto
```bash
# Build para Cloudflare
bun run pages:build

# Ejecutar con wrangler (conectado a D1 remoto)
bun run dev:cf
```

### Sincronizar Schema Local con D1
```bash
# Después de modificar prisma/schema.prisma
bun run db:push          # Actualiza SQLite local
bun run db:generate      # Regenera cliente Prisma

# Para D1 remoto
bun run d1:migrate       # Actualiza schema en D1
```

---

## 📊 Comandos Útiles

### Desarrollo
```bash
bun run dev              # Servidor desarrollo local (SQLite)
bun run dev:cf           # Servidor con D1 remoto
bun run lint             # Verificar código
```

### Base de Datos
```bash
bun run db:push          # Push schema a SQLite local
bun run d1:migrate       # Migrar schema a D1
bun run d1:seed          # Insertar datos demo
bun run d1:query "SELECT * FROM Vehicle LIMIT 5"  # Query directa
```

### Deployment
```bash
bun run pages:build      # Build para Cloudflare
bun run pages:deploy     # Deploy manual
```

### Cloudflare
```bash
bun run cf:login         # Autenticar wrangler
bun run cf:whoami        # Ver usuario autenticado
bun run d1:list          # Listar bases de datos D1
bun run r2:list          # Listar buckets R2
```

---

## 🔄 Flujo de Trabajo Recomendado

### Desarrollo Diario
1. `bun run dev` - Inicia servidor local
2. Desarrolla y prueba cambios
3. `bun run db:push` - Si modificaste el schema
4. Commit y push a GitHub
5. GitHub Actions deploya automáticamente

### Antes de Push a Producción
```bash
# 1. Verificar que todo funciona
bun run lint

# 2. Probar build
bun run pages:build

# 3. Si hay cambios de schema
bun run d1:migrate

# 4. Commit y push
git add .
git commit -m "Descripción del cambio"
git push origin main
```

---

## 🌍 URLs del Proyecto

| Entorno | URL |
|---------|-----|
| Producción | https://automotora.mastg.cl |
| Preview | https://mtgzhipu.pages.dev |
| GitHub | https://github.com/selffene-cyber/mtgzhipu |
| Cloudflare Dashboard | https://dash.cloudflare.com |

---

## 🔑 Credenciales de Demo

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@mtg.cl | admin123 |
| Ventas | ventas@mtg.cl | ventas123 |

---

## ❓ Solución de Problemas

### Error: "D1 database not found"
```bash
bun run d1:list  # Verifica que bdmtgzhipu existe
# Verifica que el binding DB esté configurado en Pages
```

### Error: "Build failed"
```bash
bun run pages:build  # Prueba build local primero
# Revisa los logs en GitHub Actions
```

### Los cambios no se reflejan
```bash
# Verifica que el deploy terminó en Cloudflare
# Limpia caché del navegador o usa incognito
```

---

## 📞 Soporte

- GitHub Issues: https://github.com/selffene-cyber/mtgzhipu/issues
- Cloudflare Status: https://www.cloudflarestatus.com
