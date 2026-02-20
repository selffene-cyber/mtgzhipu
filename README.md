# 🚗 MTG Automotora

Plataforma completa para gestión de automotora con catálogo público, panel de administración, subastas, consignaciones y más.

![MTG Automotora](https://picsum.photos/seed/mtg-banner/1200/400)

## ✨ Características

### 🌐 Portal Público
- **Catálogo de vehículos** con filtros avanzados (marca, año, precio, transmisión, combustible, región)
- **Ficha de vehículo** con galería de fotos, especificaciones y contacto WhatsApp
- **Carrusel de destacados** en página principal
- **PWA Mobile First** - 100% responsive

### 🎯 Subastas
- Sistema de pujas en tiempo real
- Anti-sniping (extensión automática)
- Depósitos de garantía
- Flujo de pago post-subasta

### 📝 Consignaciones
- Formulario público para consignantes
- Flujo de aprobación con estados
- Integración con inventario

### 💼 Panel de Administración
- Dashboard con métricas en tiempo real
- Gestión de inventario (CRUD de vehículos)
- Pipeline de leads con drag & drop
- Gestión de reservas y pagos
- Administración de subastas
- Reportes y gráficos avanzados

### 👤 Portal de Vendedor
- Dashboard personalizado
- Leads asignados
- Seguimiento de clientes

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| **Next.js 16** | Framework principal (App Router) |
| **TypeScript** | Tipado estático |
| **Tailwind CSS 4** | Estilos utility-first |
| **shadcn/ui** | Componentes UI |
| **Prisma** | ORM de base de datos |
| **Zustand** | Estado del cliente |
| **TanStack Query** | Estado del servidor |
| **Recharts** | Gráficos |
| **Cloudflare D1** | Base de datos serverless |
| **Cloudflare R2** | Almacenamiento de archivos |
| **Cloudflare Pages** | Hosting |

## 📦 Instalación

```bash
# Clonar repositorio
git clone https://github.com/selffene-cyber/mtgzhipu.git
cd mtgzhipu

# Instalar dependencias
bun install

# Configurar variables de entorno
cp .env.example .env

# Crear base de datos local
bun run db:push
bun run db:seed

# Iniciar desarrollo
bun run dev
```

## 🚀 Deployment en Cloudflare

Ver guía completa en [DEPLOY.md](./DEPLOY.md)

### Resumen rápido:

1. **Subir a GitHub** 
2. **Crear D1 Database** llamada `bdmtgzhipu`
3. **Crear R2 Bucket** llamado `mtgzhipu-files`
4. **Conectar en Cloudflare Pages**
5. **Configurar bindings y variables de entorno**
6. **Deploy!**

## 🔐 Credenciales Demo

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@mtg.cl | admin123 |
| Ventas | ventas@mtg.cl | ventas123 |

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── admin/              # Panel de administración
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── inventario/     # Gestión de vehículos
│   │   ├── subastas/       # Administrar subastas
│   │   ├── consignaciones/ # Gestionar consignaciones
│   │   ├── ventas/         # Leads y reservas
│   │   └── reportes/       # Métricas y reportes
│   ├── api/                # API Routes
│   ├── catalogo/           # Catálogo público
│   ├── subastas/           # Portal de subastas
│   ├── consignar/          # Formulario de consignación
│   ├── vendedor/           # Portal de vendedor
│   ├── login/              # Autenticación
│   └── vehiculo/[slug]/    # Ficha de vehículo
├── components/
│   ├── layout/             # Componentes de layout
│   └── ui/                 # Componentes shadcn/ui
├── lib/
│   ├── db.ts               # Cliente Prisma
│   ├── db-d1.ts            # Adaptador D1
│   └── api-utils.ts        # Utilidades API
└── stores/
    ├── auth-store.ts       # Estado de autenticación
    └── app-store.ts        # Estado global
```

## 🗄️ Modelos de Base de Datos

- **User** - Usuarios del sistema
- **Vehicle** - Vehículos en inventario
- **VehiclePhoto** - Fotos de vehículos
- **Reservation** - Reservas de vehículos
- **Auction** - Subastas
- **Bid** - Pujas
- **Consignment** - Consignaciones
- **Lead** - Prospects/clientes
- **PaymentTransaction** - Transacciones de pago
- **AuditLog** - Registro de auditoría

## 🎨 Diseño

- **Colores principales**: Azul (#3B82F6) y grises
- **Estilo**: Hexagonal, profesional, elegante
- **Responsive**: Mobile First
- **PWA**: Manifest configurado

## 📱 Módulos

### Portal Público (`/`)
- Home con carrusel y destacados
- Catálogo con filtros
- Ficha de vehículo
- Formulario de consignación

### Admin (`/admin/*`)
- Dashboard con KPIs
- CRUD de vehículos
- Pipeline de leads
- Gestión de reservas
- Administración de subastas
- Reportes con gráficos

### Vendedor (`/vendedor/*`)
- Dashboard personal
- Leads asignados

### Subastas (`/subastas`)
- Listado de subastas activas
- Sistema de pujas

## 📄 Scripts

```bash
bun run dev          # Desarrollo local
bun run build        # Build producción
bun run lint         # Verificar código
bun run db:push      # Actualizar schema
bun run db:seed      # Datos demo
bun run pages:build  # Build para Cloudflare
bun run d1:migrate   # Migrar schema a D1
```

## 📞 Contacto

**MTG Automotora**
- Email: gerencia@mastg.cl
- WhatsApp: +56 9 1234 5678

---

Desarrollado con ❤️ para MTG Automotora

