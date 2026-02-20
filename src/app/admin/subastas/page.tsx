'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Gavel, 
  Plus, 
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Auction {
  id: string;
  status: string;
  startingPrice: number;
  startTime: Date;
  endTime: Date;
  vehicle?: {
    brand: string;
    model: string;
    year: number;
    photos: { url: string }[];
  };
  bids: { amount: number }[];
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  ended_pending_payment: 'bg-yellow-100 text-yellow-700',
  closed_won: 'bg-purple-100 text-purple-700',
  closed_failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function AdminSubastasPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAuctions() {
      try {
        const res = await fetch('/api/admin/auctions');
        const data = await res.json();
        if (data.success) {
          setAuctions(data.data);
        }
      } catch (error) {
        console.error('Error fetching auctions:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAuctions();
  }, []);

  const stats = {
    scheduled: auctions.filter(a => a.status === 'scheduled').length,
    active: auctions.filter(a => a.status === 'active').length,
    ended: auctions.filter(a => ['closed_won', 'closed_failed'].includes(a.status)).length,
    totalBids: auctions.reduce((acc, a) => acc + (a.bids?.length || 0), 0),
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Subastas</h1>
            <p className="text-muted-foreground">{auctions.length} subastas en total</p>
          </div>
          <Button asChild>
            <Link href="/admin/subastas/nuevo">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Subasta
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Programadas</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.scheduled}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Activas</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Finalizadas</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.ended}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Total Pujas</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.totalBids}</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              </div>
            ) : auctions.length === 0 ? (
              <div className="p-8 text-center">
                <Gavel className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-medium mb-2">No hay subastas</h3>
                <p className="text-sm text-muted-foreground">Crea una nueva subasta para comenzar</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Precio Inicial</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auctions.map((auction) => (
                    <TableRow key={auction.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded bg-muted overflow-hidden">
                            {auction.vehicle?.photos[0]?.url && (
                              <img src={auction.vehicle.photos[0].url} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{auction.vehicle?.brand} {auction.vehicle?.model}</p>
                            <p className="text-xs text-muted-foreground">{auction.vehicle?.year}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatPrice(auction.startingPrice)}</TableCell>
                      <TableCell>{new Date(auction.startTime).toLocaleDateString('es-CL')}</TableCell>
                      <TableCell>{new Date(auction.endTime).toLocaleDateString('es-CL')}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[auction.status]}>{auction.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/subastas/${auction.id}`}>Ver</Link>
                          </Button>
                          {auction.status === 'scheduled' && (
                            <Button size="sm" variant="destructive">
                              <XCircle className="w-4 h-4" />
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
