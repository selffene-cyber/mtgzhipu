'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent } from '@/components/ui/card';
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
  Users,
  Phone,
  MessageSquare,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { getLeads, updateLead } from '@/lib/api-client';

interface Lead {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  status: string;
  source: string | null;
  createdAt: string;
  vehicle?: {
    brand: string;
    model: string;
    year: number;
    photos: { url: string }[];
  };
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  scheduled: 'bg-purple-100 text-purple-700',
  closed_won: 'bg-green-100 text-green-700',
  closed_lost: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  scheduled: 'Agendado',
  closed_won: 'Cerrado',
  closed_lost: 'Perdido',
};

export default function VendedorDashboard() {
  const { user } = useAuthStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const data = await getLeads();
        if (data.success && data.data) {
          setLeads(data.data);
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const stats = {
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    scheduled: leads.filter(l => l.status === 'scheduled').length,
    closed: leads.filter(l => l.status === 'closed_won').length,
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const result = await updateLead(id, { status: newStatus });
      
      if (result.success) {
        setLeads(leads.map(l => 
          l.id === id ? { ...l, status: newStatus } : l
        ));
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold">Bienvenido, {user?.name || 'Vendedor'}</h1>
          <p className="text-muted-foreground">Tu panel de ventas y seguimiento</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Nuevos</span>
              </div>
              <p className="text-3xl font-bold">{stats.new}</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Contactados</span>
              </div>
              <p className="text-3xl font-bold">{stats.contacted}</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Agendados</span>
              </div>
              <p className="text-3xl font-bold">{stats.scheduled}</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Cerrados</span>
              </div>
              <p className="text-3xl font-bold">{stats.closed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4">Pipeline de Ventas</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Object.entries(statusLabels).map(([status, label]) => {
                const count = leads.filter(l => l.status === status).length;
                return (
                  <div
                    key={status}
                    className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 min-w-[120px]"
                  >
                    <Badge className={statusColors[status]}>{label}</Badge>
                    <p className="text-2xl font-bold">{count}</p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${leads.length > 0 ? (count / leads.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Mis Leads Recientes</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              </div>
            ) : leads.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No hay leads asignados</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.slice(0, 10).map((lead) => (
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
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[lead.status]}>
                          {statusLabels[lead.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={`https://wa.me/${lead.customerPhone.replace('+', '')}`} target="_blank">
                              <MessageSquare className="w-4 h-4" />
                            </a>
                          </Button>
                          {lead.status === 'new' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusChange(lead.id, 'contacted')}
                            >
                              Contactar
                            </Button>
                          )}
                          {lead.status === 'contacted' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusChange(lead.id, 'scheduled')}
                            >
                              Agendar
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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-6 flex-col gap-2">
            <TrendingUp className="h-6 w-6" />
            Ver Estadísticas
          </Button>
          <Button variant="outline" className="h-auto py-6 flex-col gap-2">
            <Calendar className="h-6 w-6" />
            Mi Agenda
          </Button>
          <Button variant="outline" className="h-auto py-6 flex-col gap-2">
            <Users className="h-6 w-6" />
            Todos los Clientes
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
