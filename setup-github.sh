#!/bin/bash
# Script para configurar GitHub y subir el repositorio
# Uso: ./setup-github.sh

set -e

echo "🚀 Configurando GitHub para MTG Automotora..."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Credenciales
GITHUB_USER="selffene"
GITHUB_EMAIL="selffene@gmail.com"
REPO_NAME="mtgzhipu"
REPO_URL="https://github.com/selffene-cyber/${REPO_NAME}.git"

echo -e "${BLUE}Para subir a GitHub, necesitas un Personal Access Token.${NC}"
echo ""
echo "Pasos para crear el token:"
echo "1. Ve a https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Selecciona permisos: repo (full control)"
echo "4. Click 'Generate token'"
echo "5. Copia el token (solo se muestra una vez)"
echo ""

# Solicitar token
echo -n "Ingresa tu Personal Access Token de GitHub: "
read -s GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}Error: Token requerido${NC}"
    exit 1
fi

# Configurar git
echo ""
echo "📋 Configurando Git..."
git config user.name "$GITHUB_USER"
git config user.email "$GITHUB_EMAIL"

# Configurar remote con token
echo "🔗 Configurando remote..."
git remote set-url origin "https://${GITHUB_TOKEN}@github.com/selffene-cyber/${REPO_NAME}.git"

# Verificar que el repositorio existe o crearlo
echo "📦 Verificando repositorio..."
if ! git ls-remote origin 2>/dev/null; then
    echo -e "${YELLOW}El repositorio no existe. Creándolo...${NC}"
    
    # Crear repositorio usando la API de GitHub
    curl -s -X POST \
        -H "Authorization: token ${GITHUB_TOKEN}" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/user/repos \
        -d "{\"name\":\"${REPO_NAME}\",\"private\":false,\"description\":\"MTG Automotora - Plataforma de gestión de automotora\"}" \
        || echo "El repositorio ya existe o no se pudo crear"
fi

# Subir código
echo ""
echo "⬆️  Subiendo código a GitHub..."
git push -u origin main --force || git push -u origin master --force

echo ""
echo -e "${GREEN}✅ Repositorio subido exitosamente!${NC}"
echo ""
echo "Siguientes pasos:"
echo "1. Ve a https://github.com/selffene-cyber/${REPO_NAME}/settings/secrets/actions"
echo "2. Agrega los secrets necesarios (ver GITHUB-SETUP.md)"
echo "3. Cada push a main disparará un deployment automático"
echo ""
