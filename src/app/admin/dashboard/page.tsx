'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Car,
  Users,
  Clock,
  DollarSign,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getStats, getLeads, getVehicles, getReservations } from '@/lib/api-client';

interface Stats {
  vehicles: number;
  leads: number;
  leadsNew: number;
  auctions: number;
  reservations: number;
}

interface Lead {
  id: string;
  customerName: string;
  customerPhone: string;
  status: string;
  brand?: string;
  model?: string;
  createdAt: string;
}

interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  primaryPhoto?: string;
}

interface Reservation {
  id: string;
  customerName: string;
  amount: number;
  status: string;
  brand?: string;
  model?: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  scheduled: 'bg-green-100 text-green-800',
  closed_won: 'bg-emerald-100 text-emerald-800',
  closed_lost: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  scheduled: 'Agendado',
  closed_won: 'Cerrado',
  closed_lost: 'Perdido',
};

const reservationStatusColors: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const reservationStatusLabels: Record<string, string> = {
  pending_payment: 'Pendiente',
  paid: 'Pagado',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
  });
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ vehicles: 0, leads: 0, leadsNew: 0, auctions: 0, reservations: 0 });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentVehicles, setRecentVehicles] = useState<Vehicle[]>([]);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, leadsRes, vehiclesRes, reservationsRes] = await Promise.all([
          getStats(),
          getLeads(),
          getVehicles({ limit: 5 }),
          getReservations(),
        ]);

        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (leadsRes.success && leadsRes.data) setRecentLeads(leadsRes.data.slice(0, 5));
        if (vehiclesRes.success && vehiclesRes.data) setRecentVehicles(vehiclesRes.data.slice(0, 5));
        if (reservationsRes.success && reservationsRes.data) setRecentReservations(reservationsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de la actividad</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Car className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vehículos</p>
                  <p className="text-2xl font-bold">{stats.vehicles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Leads</p>
                  <p className="text-2xl font-bold">{stats.leads}</p>
                  {stats.leadsNew > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {stats.leadsNew} nuevos
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subastas</p>
                  <p className="text-2xl font-bold">{stats.auctions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reservas</p>
                  <p className="text-2xl font-bold">{stats.reservations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Leads Recientes</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/ventas/leads">
                  Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse h-12 bg-muted rounded" />
                  ))}
                </div>
              ) : recentLeads.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No hay leads</p>
              ) : (
                <div className="space-y-3">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{lead.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {lead.brand} {lead.model}
                        </p>
                      </div>
                      <Badge className={statusColors[lead.status] || ''}>
                        {statusLabels[lead.status] || lead.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Vehicles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Vehículos Recientes</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/inventario/vehiculos">
                  Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse h-12 bg-muted rounded" />
                  ))}
                </div>
              ) : recentVehicles.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No hay vehículos</p>
              ) : (
                <div className="space-y-3">
                  {recentVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-12 h-12 rounded bg-muted overflow-hidden">
                        <img
                          src={vehicle.primaryPhoto || `https://picsum.photos/seed/${vehicle.slug}/100/100`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.year} • {formatPrice(vehicle.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reservations */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Reservas Recientes</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/ventas/reservas">
                  Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse h-12 bg-muted rounded" />
                  ))}
                </div>
              ) : recentReservations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No hay reservas</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground border-b">
                        <th className="pb-2">Cliente</th>
                        <th className="pb-2">Vehículo</th>
                        <th className="pb-2">Monto</th>
                        <th className="pb-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {recentReservations.map((reservation) => (
                        <tr key={reservation.id}>
                          <td className="py-3">
                            <p className="font-medium">{reservation.customerName}</p>
                          </td>
                          <td className="py-3">
                            <p className="text-muted-foreground">
                              {reservation.brand} {reservation.model}
                            </p>
                          </td>
                          <td className="py-3">
                            <p className="font-medium">{formatPrice(reservation.amount)}</p>
                          </td>
                          <td className="py-3">
                            <Badge className={reservationStatusColors[reservation.status] || ''}>
                              {reservationStatusLabels[reservation.status] || reservation.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
