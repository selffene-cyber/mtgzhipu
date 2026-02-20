'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar, 
  Search, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  amount: number;
  status: string;
  expiresAt: string;
  createdAt: string;
  vehicle?: {
    brand: string;
    model: string;
    year: number;
    photos: { url: string }[];
  };
}

const statusColors: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  confirmed: 'bg-blue-100 text-blue-700',
  expired: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-purple-100 text-purple-700',
};

const statusLabels: Record<string, string> = {
  pending_payment: 'Pendiente',
  paid: 'Pagado',
  confirmed: 'Confirmado',
  expired: 'Expirado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function AdminReservasPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchReservations() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter && statusFilter !== 'all') {
          params.set('status', statusFilter);
        }
        
        const res = await fetch(`/api/reservations?${params}`);
        const data = await res.json();
        
        if (data.success) {
          setReservations(data.data);
        }
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReservations();
  }, [statusFilter]);

  const filteredReservations = reservations.filter(r => 
    r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.customerPhone.includes(searchQuery)
  );

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        setReservations(reservations.map(r => 
          r.id === id ? { ...r, status: newStatus } : r
        ));
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  };

  const isExpiringSoon = (expiresAt: string) => {
    const hours = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60);
    return hours > 0 && hours < 12;
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Reservas</h1>
            <p className="text-muted-foreground">
              {reservations.length} reservas en total
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['pending_payment', 'paid', 'confirmed', 'expired'].map((status) => {
            const count = reservations.filter(r => r.status === status).length;
            return (
              <Card 
                key={status} 
                className={`cursor-pointer hover:border-primary ${statusFilter === status ? 'border-primary' : ''}`}
                onClick={() => setStatusFilter(status === statusFilter ? 'all' : status)}
              >
                <CardContent className="p-4 text-center">
                  <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>
                  <p className="text-2xl font-bold mt-2">{count}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o teléfono..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(statusLabels).map(([status, label]) => (
                    <SelectItem key={status} value={status}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-medium mb-2">No hay reservas</h3>
                <p className="text-sm text-muted-foreground">
                  Las reservas aparecerán aquí cuando los clientes realicen abonos
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Abono</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{reservation.customerName}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {reservation.customerPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {reservation.vehicle ? (
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-8 rounded bg-muted overflow-hidden">
                              {reservation.vehicle.photos[0]?.url && (
                                <img 
                                  src={reservation.vehicle.photos[0].url} 
                                  alt="" 
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <span className="text-sm">
                              {reservation.vehicle.brand} {reservation.vehicle.model}
                            </span>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(reservation.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[reservation.status]}>
                          {statusLabels[reservation.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {reservation.status === 'pending_payment' && (
                          <div className={`flex items-center gap-1 text-sm ${
                            isExpired(reservation.expiresAt) 
                              ? 'text-red-500' 
                              : isExpiringSoon(reservation.expiresAt) 
                                ? 'text-yellow-600' 
                                : 'text-muted-foreground'
                          }`}>
                            <Clock className="h-3 w-3" />
                            {isExpired(reservation.expiresAt) 
                              ? 'Expirado' 
                              : new Date(reservation.expiresAt).toLocaleString('es-CL', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {reservation.status === 'pending_payment' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusChange(reservation.id, 'paid')}
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                          {reservation.status === 'paid' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                            >
                              Confirmar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
