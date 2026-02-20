'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileCheck, 
  CheckCircle, 
  XCircle,
  Clock,
  Eye,
  Loader2
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Consignment {
  id: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string | null;
  brand: string;
  model: string;
  year: number;
  expectedPrice: number | null;
  status: string;
  createdAt: Date;
}

const statusColors: Record<string, string> = {
  received: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  published: 'bg-purple-100 text-purple-700',
};

const statusLabels: Record<string, string> = {
  received: 'Recibido',
  under_review: 'En Revisión',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  published: 'Publicado',
};

export default function AdminConsignacionesPage() {
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConsignments() {
      try {
        const res = await fetch('/api/consignments');
        const data = await res.json();
        if (data.success) {
          setConsignments(data.data);
        }
      } catch (error) {
        console.error('Error fetching consignments:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchConsignments();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/consignments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        setConsignments(consignments.map(c => 
          c.id === id ? { ...c, status: newStatus } : c
        ));
      }
    } catch (error) {
      console.error('Error updating consignment:', error);
    }
  };

  const stats = {
    received: consignments.filter(c => c.status === 'received').length,
    underReview: consignments.filter(c => c.status === 'under_review').length,
    approved: consignments.filter(c => c.status === 'approved').length,
    published: consignments.filter(c => c.status === 'published').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Consignaciones</h1>
          <p className="text-muted-foreground">{consignments.length} solicitudes en total</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Recibidos', value: stats.received, color: 'text-blue-600' },
            { label: 'En Revisión', value: stats.underReview, color: 'text-yellow-600' },
            { label: 'Aprobados', value: stats.approved, color: 'text-green-600' },
            { label: 'Publicados', value: stats.published, color: 'text-purple-600' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              </div>
            ) : consignments.length === 0 ? (
              <div className="p-8 text-center">
                <FileCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-medium mb-2">No hay consignaciones</h3>
                <p className="text-sm text-muted-foreground">Las solicitudes aparecerán aquí</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Propietario</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Precio Esperado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consignments.map((consignment) => (
                    <TableRow key={consignment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{consignment.ownerName}</p>
                          <p className="text-xs text-muted-foreground">{consignment.ownerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p>{consignment.brand} {consignment.model} ({consignment.year})</p>
                      </TableCell>
                      <TableCell>
                        {consignment.expectedPrice ? `$${consignment.expectedPrice.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[consignment.status]}>
                          {statusLabels[consignment.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(consignment.createdAt).toLocaleDateString('es-CL')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {consignment.status === 'received' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusChange(consignment.id, 'under_review')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {consignment.status === 'under_review' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleStatusChange(consignment.id, 'approved')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleStatusChange(consignment.id, 'rejected')}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {consignment.status === 'approved' && (
                            <Button 
                              size="sm"
                              onClick={() => handleStatusChange(consignment.id, 'published')}
                            >
                              Publicar
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
