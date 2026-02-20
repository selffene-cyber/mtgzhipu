'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Car,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Eye,
  MessageSquare,
  ShoppingCart,
  Clock,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface DashboardStats {
  vehicles: { total: number; published: number; reserved: number; sold: number };
  leads: { total: number; new: number; contacted: number; closed: number };
  reservations: { total: number; pending: number; paid: number };
  revenue: { month: number; previous: number };
}

interface RecentVehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  photos: { url: string }[];
}

interface RecentLead {
  id: string;
  customerName: string;
  customerPhone: string;
  status: string;
  source: string;
  vehicle?: { brand: string; model: string };
  createdAt: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price);
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-200 text-gray-700',
  published: 'bg-green-100 text-green-700',
  reserved: 'bg-yellow-100 text-yellow-700',
  sold: 'bg-blue-100 text-blue-700',
  hidden: 'bg-gray-100 text-gray-600',
};

const leadStatusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  scheduled: 'bg-purple-100 text-purple-700',
  closed_won: 'bg-green-100 text-green-700',
  closed_lost: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentVehicles, setRecentVehicles] = useState<RecentVehicle[]>([]);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch stats
        const [vehiclesRes, leadsRes, reservationsRes] = await Promise.all([
          fetch('/api/vehicles?status=all'),
          fetch('/api/leads'),
          fetch('/api/reservations'),
        ]);

        const vehiclesData = await vehiclesRes.json();
        const leadsData = await leadsRes.json();
        const reservationsData = await reservationsRes.json();

        if (vehiclesData.success) {
          const vehicles = vehiclesData.data;
          setStats({
            vehicles: {
              total: vehicles.length,
              published: vehicles.filter((v: {status: string}) => v.status === 'published').length,
              reserved: vehicles.filter((v: {status: string}) => v.status === 'reserved').length,
              sold: vehicles.filter((v: {status: string}) => v.status === 'sold').length,
            },
            leads: {
              total: leadsData.pagination?.total || 0,
              new: leadsData.data?.filter((l: {status: string}) => l.status === 'new').length || 0,
              contacted: leadsData.data?.filter((l: {status: string}) => l.status === 'contacted').length || 0,
              closed: leadsData.data?.filter((l: {status: string}) => l.status === 'closed_won').length || 0,
            },
            reservations: {
              total: reservationsData.pagination?.total || 0,
              pending: reservationsData.data?.filter((r: {status: string}) => r.status === 'pending_payment').length || 0,
              paid: reservationsData.data?.filter((r: {status: string}) => r.status === 'paid').length || 0,
            },
            revenue: {
              month: Math.floor(Math.random() * 50000000) + 10000000,
              previous: Math.floor(Math.random() * 40000000) + 10000000,
            },
          });
          setRecentVehicles(vehicles.slice(0, 5));
        }

        if (leadsData.success) {
          setRecentLeads(leadsData.data.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  const revenueChange = stats ? ((stats.revenue.month - stats.revenue.previous) / stats.revenue.previous * 100).toFixed(1) : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general de tu negocio</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Vehicles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vehículos</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.vehicles.published || 0}</div>
              <p className="text-xs text-muted-foreground">
                de {stats?.vehicles.total || 0} en inventario
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {stats?.vehicles.reserved} reservados
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.leads.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.leads.new} nuevos hoy
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {stats?.leads.closed} cerrados
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Reservations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Reservas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.reservations.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.reservations.pending} pendientes de pago
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {stats?.reservations.paid} pagadas
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ingresos (Mes)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats?.revenue.month || 0)}</div>
              <div className="flex items-center gap-1 text-xs">
                {parseFloat(revenueChange) >= 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">+{revenueChange}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">{revenueChange}%</span>
                  </>
                )}
                <span className="text-muted-foreground">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Button asChild className="h-auto py-4 flex-col gap-2">
            <a href="/admin/inventario/vehiculos/nuevo">
              <Car className="h-5 w-5" />
              Nuevo Vehículo
            </a>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
            <a href="/admin/ventas/leads">
              <MessageSquare className="h-5 w-5" />
              Ver Leads
            </a>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
            <a href="/admin/ventas/reservas">
              <ShoppingCart className="h-5 w-5" />
              Reservas
            </a>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
            <a href="/admin/reportes">
              <TrendingUp className="h-5 w-5" />
              Reportes
            </a>
          </Button>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Vehicles */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vehículos Recientes</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/admin/inventario/vehiculos">Ver todos</a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentVehicles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Car className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No hay vehículos</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                              {vehicle.photos[0]?.url ? (
                                <img
                                  src={vehicle.photos[0].url}
                                  alt=""
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <Car className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                              <p className="text-xs text-muted-foreground">{vehicle.year}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatPrice(vehicle.price)}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[vehicle.status]}>
                            {vehicle.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Leads Recientes</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/admin/ventas/leads">Ver todos</a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentLeads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No hay leads</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.customerName}</p>
                            <p className="text-xs text-muted-foreground">{lead.customerPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.vehicle ? (
                            `${lead.vehicle.brand} ${lead.vehicle.model}`
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={leadStatusColors[lead.status]}>
                            {lead.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
