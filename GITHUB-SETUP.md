# Configuración de GitHub Secrets y Variables

Para que el deployment automático funcione, necesitas configurar los siguientes secrets en tu repositorio de GitHub.

## Pasos para configurar

1. Ve a tu repositorio en GitHub: https://github.com/selffene-cyber/mtgzhipu
2. Click en **Settings** (Configuración)
3. En el menú lateral, ve a **Secrets and variables** → **Actions**
4. Click en **New repository secret** para agregar cada uno

## Secrets Requeridos

### CLOUDFLARE_API_TOKEN
1. Ve a https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Usa el template "Edit Cloudflare Workers" o crea uno personalizado con estos permisos:
   - Account → Cloudflare Pages: Edit
   - Account → D1: Edit
   - Account → Workers R2 Storage: Edit
   - Zone → DNS: Edit
4. Copia el token y agrégalo como secret

### CLOUDFLARE_ACCOUNT_ID
1. Ve a https://dash.cloudflare.com
2. En la barra lateral derecha, verás "Account ID"
3. Copia ese valor y agrégalo como secret

## Variables de Entorno

En la misma sección, puedes agregar **Variables** (no secrets):

| Variable | Valor |
|----------|-------|
| NEXT_PUBLIC_APP_NAME | MTG Automotora |
| NEXT_PUBLIC_APP_URL | https://automotora.mastg.cl |
| NEXT_PUBLIC_APP_URL_DEV | https://dev.automotora.mastg.cl |

## Secrets Adicionales (Opcionales)

Si usas pasarelas de pago reales:

```
MERCADOPAGO_ACCESS_TOKEN
MERCADOPAGO_PUBLIC_KEY
WEBPAY_COMMERCE_CODE
WEBPAY_API_KEY
NEXTAUTH_SECRET
```

## Verificar Configuración

Después de configurar los secrets, cada push a `main` disparará automáticamente un deployment a Cloudflare Pages.

Puedes ver el progreso en:
- GitHub: https://github.com/selffene-cyber/mtgzhipu/actions
- Cloudflare: https://dash.cloudflare.com → Workers & Pages → mtgzhipu
