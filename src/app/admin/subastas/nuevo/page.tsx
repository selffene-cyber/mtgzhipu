'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Gavel, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
}

export default function NuevaSubastaPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    startingPrice: '',
    minIncrement: '100000',
    depositAmount: '50000',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const res = await fetch('/api/vehicles?status=published');
        const data = await res.json();
        if (data.success) {
          setVehicles(data.data);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    }
    fetchVehicles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: formData.vehicleId,
          startingPrice: parseInt(formData.startingPrice),
          minIncrement: parseInt(formData.minIncrement),
          depositAmount: parseInt(formData.depositAmount),
          startTime: formData.startTime,
          endTime: formData.endTime,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin/subastas');
      }
    } catch (error) {
      console.error('Error creating auction:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Nueva Subasta</h1>
          <p className="text-muted-foreground">Programa una nueva subasta de vehículo</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="w-5 h-5" />
              Configurar Subasta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehicle Selection */}
              <div className="space-y-2">
                <Label>Vehículo *</Label>
                <Select 
                  value={formData.vehicleId} 
                  onValueChange={(v) => {
                    const vehicle = vehicles.find(vh => vh.id === v);
                    setFormData({ 
                      ...formData, 
                      vehicleId: v,
                      startingPrice: vehicle ? Math.round(vehicle.price * 0.7).toString() : ''
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} ({vehicle.year}) - ${vehicle.price.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Starting Price */}
              <div className="space-y-2">
                <Label htmlFor="startingPrice">Precio Inicial (CLP) *</Label>
                <Input
                  id="startingPrice"
                  type="number"
                  value={formData.startingPrice}
                  onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                  placeholder="Precio inicial de la subasta"
                  required
                />
                {selectedVehicle && (
                  <p className="text-sm text-muted-foreground">
                    Precio del vehículo: ${selectedVehicle.price.toLocaleString()} CLP
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minIncrement">Incremento Mínimo (CLP)</Label>
                  <Input
                    id="minIncrement"
                    type="number"
                    value={formData.minIncrement}
                    onChange={(e) => setFormData({ ...formData, minIncrement: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Depósito Ganador (CLP)</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Fecha de Inicio *</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">Fecha de Término *</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 gradient-mtg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Subasta'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Información</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• El vehículo debe estar publicado para poder subastarse</li>
              <li>• El sistema tiene anti-sniping: +5 min si hay puja al final</li>
              <li>• El ganador tendrá 24h para pagar el depósito</li>
              <li>• Si no hay pujas, el vehículo vuelve al catálogo</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
