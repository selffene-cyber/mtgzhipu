'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Car, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Image as ImageIcon,
  Filter
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number | null;
  status: string;
  region: string | null;
  photos: { url: string }[];
  createdAt: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-green-100 text-green-700',
  hidden: 'bg-gray-100 text-gray-600',
  reserved: 'bg-yellow-100 text-yellow-700',
  sold: 'bg-blue-100 text-blue-700',
  archived: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  hidden: 'Oculto',
  reserved: 'Reservado',
  sold: 'Vendido',
  archived: 'Archivado',
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function AdminVehiculosPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchVehicles() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter && statusFilter !== 'all') {
          params.set('status', statusFilter);
        }
        
        const res = await fetch(`/api/vehicles?${params}`);
        const data = await res.json();
        
        if (data.success) {
          setVehicles(data.data);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, [statusFilter]);

  const filteredVehicles = vehicles.filter(v => 
    `${v.brand} ${v.model}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = async (slug: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/vehicles/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        setVehicles(vehicles.map(v => 
          v.slug === slug ? { ...v, status: newStatus } : v
        ));
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Vehículos</h1>
            <p className="text-muted-foreground">
              {vehicles.length} vehículos en inventario
            </p>
          </div>
          <Button asChild>
            <a href="/admin/inventario/vehiculos/nuevo">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Vehículo
            </a>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por marca o modelo..."
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
                  <SelectItem value="published">Publicados</SelectItem>
                  <SelectItem value="draft">Borradores</SelectItem>
                  <SelectItem value="reserved">Reservados</SelectItem>
                  <SelectItem value="sold">Vendidos</SelectItem>
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
            ) : filteredVehicles.length === 0 ? (
              <div className="p-8 text-center">
                <Car className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-medium mb-2">No hay vehículos</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No se encontraron resultados' : 'Comienza agregando un vehículo'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>KM</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                            {vehicle.photos[0]?.url ? (
                              <img
                                src={vehicle.photos[0].url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                            <p className="text-xs text-muted-foreground">{vehicle.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>{vehicle.km?.toLocaleString() || '-'} km</TableCell>
                      <TableCell className="font-medium">{formatPrice(vehicle.price)}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[vehicle.status]}>
                          {statusLabels[vehicle.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{vehicle.region || '-'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <a href={`/vehiculo/${vehicle.slug}`} target="_blank">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver público
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`/admin/inventario/vehiculos/${vehicle.slug}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </a>
                            </DropdownMenuItem>
                            {vehicle.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(vehicle.slug, 'published')}>
                                Publicar
                              </DropdownMenuItem>
                            )}
                            {vehicle.status === 'published' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(vehicle.slug, 'hidden')}>
                                Ocultar
                              </DropdownMenuItem>
                            )}
                            {vehicle.status === 'hidden' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(vehicle.slug, 'published')}>
                                Republicar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleStatusChange(vehicle.slug, 'archived')}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Archivar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
