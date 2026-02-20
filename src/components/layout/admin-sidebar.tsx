"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Package,
  ShoppingCart,
  Gavel,
  FileCheck,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  User,
  Car,
  Image,
  FileText,
  Users,
  Calendar,
  History,
  Clock,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// User roles type
type UserRole = "admin" | "sales" | "viewer"

// Navigation item type
interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

// Navigation group type with collapsible support
interface NavGroup {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
  roles: UserRole[]
}

// Mock user data - in real app, this would come from auth context
const mockUser = {
  name: "Carlos Mendoza",
  email: "carlos@mtgautomotora.com",
  role: "admin" as UserRole,
  avatar: "/avatars/carlos.jpg",
}

// Navigation configuration
const navigationConfig: (NavItem | NavGroup)[] = [
  // Dashboard - single item
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: Home,
    roles: ["admin", "sales", "viewer"],
  },
  // Inventario - collapsible group
  {
    title: "Inventario",
    icon: Package,
    roles: ["admin", "sales", "viewer"],
    items: [
      { title: "Vehículos", href: "/admin/inventario/vehiculos", icon: Car, roles: ["admin", "sales", "viewer"] },
      { title: "Fotos", href: "/admin/inventario/fotos", icon: Image, roles: ["admin", "sales"] },
      { title: "Documentos", href: "/admin/inventario/documentos", icon: FileText, roles: ["admin", "sales"] },
    ],
  },
  // Ventas - collapsible group
  {
    title: "Ventas",
    icon: ShoppingCart,
    roles: ["admin", "sales", "viewer"],
    items: [
      { title: "Reservas", href: "/admin/ventas/reservas", icon: Calendar, roles: ["admin", "sales", "viewer"] },
      { title: "Leads", href: "/admin/ventas/leads", icon: Users, roles: ["admin", "sales"] },
      { title: "Clientes", href: "/admin/ventas/clientes", icon: Users, roles: ["admin", "sales", "viewer"] },
    ],
  },
  // Subastas - single item
  {
    title: "Subastas",
    href: "/admin/subastas",
    icon: Gavel,
    roles: ["admin", "sales"],
  },
  // Consignaciones - single item
  {
    title: "Consignaciones",
    href: "/admin/consignaciones",
    icon: FileCheck,
    roles: ["admin", "sales"],
  },
  // Reportes - single item
  {
    title: "Reportes",
    href: "/admin/reportes",
    icon: BarChart3,
    roles: ["admin"],
  },
  // Configuración - single item
  {
    title: "Configuración",
    href: "/admin/configuracion",
    icon: Settings,
    roles: ["admin"],
  },
]

// Check if user has access to item
function hasAccess(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}

// Check if navigation item is a group
function isNavGroup(item: NavItem | NavGroup): item is NavGroup {
  return "items" in item
}

// Get role badge variant
function getRoleBadgeVariant(role: UserRole): "default" | "secondary" | "outline" {
  switch (role) {
    case "admin":
      return "default"
    case "sales":
      return "secondary"
    default:
      return "outline"
  }
}

// Get role display name
function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Administrador"
    case "sales":
      return "Ventas"
    default:
      return "Visor"
  }
}

// Collapsible Navigation Group Component
function CollapsibleNavGroup({
  group,
  userRole,
  currentPath,
}: {
  group: NavGroup
  userRole: UserRole
  currentPath: string
}) {
  const { state } = useSidebar()
  const [isOpen, setIsOpen] = React.useState(true)
  const Icon = group.icon

  // Check if any child is active
  const hasActiveChild = group.items.some(
    (item) => currentPath === item.href || currentPath.startsWith(item.href + "/")
  )

  // Auto-expand if has active child
  React.useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true)
    }
  }, [hasActiveChild])

  // Filter items by role
  const visibleItems = group.items.filter((item) => hasAccess(userRole, item.roles))

  if (visibleItems.length === 0) return null

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarGroup>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={group.title}
            className={cn(
              "w-full justify-between",
              hasActiveChild && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <Icon className="size-4" />
              <span>{group.title}</span>
            </div>
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                isOpen && "rotate-180",
                state === "collapsed" && "hidden"
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {visibleItems.map((item) => {
              const ItemIcon = item.icon
              const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/")
              return (
                <SidebarMenuSubItem key={item.href}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isActive}
                  >
                    <Link href={item.href}>
                      <ItemIcon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

// Single Navigation Item Component
function SingleNavItem({
  item,
  userRole,
  currentPath,
}: {
  item: NavItem
  userRole: UserRole
  currentPath: string
}) {
  const Icon = item.icon
  const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/")

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive}
            tooltip={item.title}
          >
            <Link href={item.href}>
              <Icon className="size-4" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

// User Profile Component
function UserProfile({ user }: { user: typeof mockUser }) {
  const { state } = useSidebar()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="size-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div
            className={cn(
              "grid flex-1 text-left text-sm leading-tight",
              state === "collapsed" && "hidden"
            )}
          >
            <span className="truncate font-semibold">{user.name}</span>
            <div className="flex items-center gap-2">
              <Badge
                variant={getRoleBadgeVariant(user.role)}
                className="px-1.5 py-0 text-[10px]"
              >
                {getRoleDisplayName(user.role)}
              </Badge>
            </div>
          </div>
          <ChevronRight
            className={cn(
              "ml-auto size-4",
              state === "collapsed" && "hidden"
            )}
          />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="top"
        align="start"
        sideOffset={4}
      >
        <DropdownMenuItem asChild>
          <Link href="/admin/perfil" className="flex items-center gap-2">
            <User className="size-4" />
            Mi Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/configuracion" className="flex items-center gap-2">
            <Settings className="size-4" />
            Configuración
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/logout" className="flex items-center gap-2 text-destructive focus:text-destructive">
            <LogOut className="size-4" />
            Cerrar Sesión
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Logout Button for collapsed state
function LogoutButton() {
  const { state } = useSidebar()

  if (state !== "collapsed") return null

  return (
    <SidebarMenuButton
      tooltip="Cerrar Sesión"
      className="text-destructive hover:text-destructive"
      asChild
    >
      <Link href="/logout">
        <LogOut className="size-4" />
        <span>Cerrar Sesión</span>
      </Link>
    </SidebarMenuButton>
  )
}

// Main Admin Sidebar Component
export function AdminSidebar({
  user = mockUser,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: typeof mockUser
}) {
  const pathname = usePathname()

  // Filter navigation by user role
  const visibleNavigation = navigationConfig.filter((item) =>
    hasAccess(user.role, isNavGroup(item) ? item.roles : item.roles)
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header with MTG Branding */}
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">MTG</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold">MTG Automotora</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Panel de Administración
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        {visibleNavigation.map((item) => {
          if (isNavGroup(item)) {
            return (
              <CollapsibleNavGroup
                key={item.title}
                group={item}
                userRole={user.role}
                currentPath={pathname}
              />
            )
          }
          return (
            <SingleNavItem
              key={item.title}
              item={item}
              userRole={user.role}
              currentPath={pathname}
            />
          )
        })}
      </SidebarContent>

      {/* Footer with User Profile */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <UserProfile user={user} />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <LogoutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Rail for toggling sidebar */}
      <SidebarRail />
    </Sidebar>
  )
}

export default AdminSidebar
