#!/bin/bash
# MTG Automotora - Script de Configuración Inicial
# Este script configura todos los recursos en Cloudflare

set -e

echo "🚀 Configurando MTG Automotora para Cloudflare..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que wrangler está autenticado
check_auth() {
    echo "📋 Verificando autenticación de Cloudflare..."
    if ! bunx wrangler whoami &> /dev/null; then
        echo -e "${YELLOW}⚠️  No estás autenticado en Cloudflare${NC}"
        echo " Ejecuta: bunx wrangler login"
        echo " O configura CLOUDFLARE_API_TOKEN"
        exit 1
    fi
    echo -e "${GREEN}✓ Autenticado en Cloudflare${NC}"
}

# Crear base de datos D1
create_d1_database() {
    echo ""
    echo "🗄️  Creando base de datos D1: bdmtgzhipu..."
    
    # Verificar si ya existe
    if bunx wrangler d1 list 2>/dev/null | grep -q "bdmtgzhipu"; then
        echo -e "${YELLOW}⚠️  La base de datos bdmtgzhipu ya existe${NC}"
    else
        bunx wrangler d1 create bdmtgzhipu
        echo -e "${GREEN}✓ Base de datos creada${NC}"
    fi
}

# Obtener Database ID
get_database_id() {
    echo ""
    echo "📝 Obteniendo ID de la base de datos..."
    DATABASE_ID=$(bunx wrangler d1 list 2>/dev/null | grep "bdmtgzhipu" | awk '{print $1}')
    echo "Database ID: $DATABASE_ID"
    
    # Actualizar wrangler.toml
    if [ ! -z "$DATABASE_ID" ]; then
        sed -i "s/PLACEHOLDER_D1_DATABASE_ID/$DATABASE_ID/g" wrangler.toml
        echo -e "${GREEN}✓ wrangler.toml actualizado${NC}"
    fi
}

# Ejecutar schema SQL
execute_schema() {
    echo ""
    echo "📊 Ejecutando schema SQL en D1..."
    bunx wrangler d1 execute bdmtgzhipu --file=./prisma/migrations/d1-schema.sql
    echo -e "${GREEN}✓ Schema ejecutado${NC}"
}

# Ejecutar seed SQL
execute_seed() {
    echo ""
    echo "🌱 Ejecutando seed SQL en D1..."
    bunx wrangler d1 execute bdmtgzhipu --file=./prisma/migrations/d1-seed.sql
    echo -e "${GREEN}✓ Datos de demo insertados${NC}"
}

# Crear bucket R2
create_r2_bucket() {
    echo ""
    echo "📦 Creando bucket R2: mtgzhipu-files..."
    
    # Verificar si ya existe
    if bunx wrangler r2 bucket list 2>/dev/null | grep -q "mtgzhipu-files"; then
        echo -e "${YELLOW}⚠️  El bucket mtgzhipu-files ya existe${NC}"
    else
        bunx wrangler r2 bucket create mtgzhipu-files
        echo -e "${GREEN}✓ Bucket R2 creado${NC}"
    fi
}

# Crear proyecto Pages (esto se hace desde el dashboard o conectando GitHub)
create_pages_project() {
    echo ""
    echo "🌐 Para crear el proyecto en Cloudflare Pages:"
    echo "1. Ve a https://dash.cloudflare.com"
    echo "2. Workers & Pages → Create application → Pages → Connect to Git"
    echo "3. Selecciona el repositorio: selffene-cyber/mtgzhipu"
    echo "4. Configura:"
    echo "   - Build command: npm run pages:build"
    echo "   - Output directory: .vercel/output/static"
    echo "5. Agrega los bindings D1 (DB) y R2 (BUCKET)"
    echo ""
}

# Configurar DNS
configure_dns() {
    echo ""
    echo "dns 🔧 Para configurar el DNS automotora.mastg.cl:"
    echo "1. En Cloudflare Dashboard, ve a tu dominio mastg.cl"
    echo "2. DNS → Add Record"
    echo "   - Type: CNAME"
    echo "   - Name: automotora"
    echo "   - Target: mtgzhipu.pages.dev"
    echo "   - Proxy status: Proxied (naranja)"
    echo ""
}

# Ejecutar todo
main() {
    check_auth
    create_d1_database
    get_database_id
    execute_schema
    execute_seed
    create_r2_bucket
    create_pages_project
    configure_dns
    
    echo ""
    echo -e "${GREEN}✅ Configuración completada!${NC}"
    echo ""
    echo "Siguientes pasos:"
    echo "1. Conectar GitHub en Cloudflare Pages Dashboard"
    echo "2. Configurar dominio automotora.mastg.cl"
    echo "3. Configurar variables de entorno"
    echo ""
}

main "$@"
