'use client';

export const runtime = 'edge';

import { PublicLayout } from '@/components/layout/public-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import { 
  Phone, 
  Heart, 
  Share2, 
  MapPin, 
  Gauge, 
  Fuel, 
  Settings, 
  Calendar,
  CheckCircle,
  Shield,
  ChevronLeft
} from 'lucide-react';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';

interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number | null;
  region: string | null;
  city: string | null;
  description: string | null;
  transmission: string | null;
  fuelType: string | null;
  color: string | null;
  doors: number | null;
  engine: string | null;
  horsepower: number | null;
  photos: { url: string; orderIndex: number }[];
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatKm(km: number | null): string {
  if (!km) return 'N/A';
  return new Intl.NumberFormat('es-CL').format(km) + ' km';
}

const fuelLabels: Record<string, string> = {
  gasoline: 'Bencina',
  diesel: 'Diésel',
  electric: 'Eléctrico',
  hybrid: 'Híbrido',
};

const transmissionLabels: Record<string, string> = {
  automatic: 'Automática',
  manual: 'Manual',
};

export default function VehicleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchVehicle() {
      try {
        const res = await fetch(`/api/vehicles/${resolvedParams.slug}`);
        const data = await res.json();
        
        if (data.success) {
          setVehicle(data.data);
        } else {
          setError('Vehículo no encontrado');
        }
      } catch {
        setError('Error al cargar el vehículo');
      } finally {
        setLoading(false);
      }
    }
    fetchVehicle();
  }, [resolvedParams.slug]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="container px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="aspect-video bg-muted rounded-xl" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !vehicle) {
    return (
      <PublicLayout>
        <div className="container px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">{error || 'Vehículo no encontrado'}</h1>
          <Button asChild>
            <Link href="/catalogo">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Volver al catálogo
            </Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Inicio</Link>
          <span>/</span>
          <Link href="/catalogo" className="hover:text-foreground">Catálogo</Link>
          <span>/</span>
          <span className="text-foreground">{vehicle.brand} {vehicle.model}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div className="space-y-4">
            <Carousel className="w-full">
              <CarouselContent>
                {vehicle.photos.map((photo, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                      <img
                        src={photo.url}
                        alt={`${vehicle.brand} ${vehicle.model} - Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {vehicle.photos.length > 1 && (
                <>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </>
              )}
            </Carousel>

            {/* Thumbnails */}
            {vehicle.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {vehicle.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="w-20 h-16 rounded-lg overflow-hidden bg-muted shrink-0 cursor-pointer hover:ring-2 ring-primary transition-all"
                  >
                    <img
                      src={photo.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="secondary" className="mb-2">{vehicle.year}</Badge>
                  <h1 className="text-3xl font-bold">
                    {vehicle.brand} {vehicle.model}
                  </h1>
                  {(vehicle.region || vehicle.city) && (
                    <div className="flex items-center gap-1 text-muted-foreground mt-2">
                      <MapPin className="h-4 w-4" />
                      <span>{vehicle.city || vehicle.region}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-4xl font-bold text-primary">
                  {formatPrice(vehicle.price)}
                </p>
              </div>
            </div>

            {/* Specs */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Gauge className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">{formatKm(vehicle.km)}</p>
                    <p className="text-xs text-muted-foreground">Kilometraje</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Fuel className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {vehicle.fuelType ? fuelLabels[vehicle.fuelType] : 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">Combustible</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Settings className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {vehicle.transmission ? transmissionLabels[vehicle.transmission] : 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">Transmisión</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">{vehicle.year}</p>
                    <p className="text-xs text-muted-foreground">Año</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            {(vehicle.color || vehicle.doors || vehicle.engine || vehicle.horsepower) && (
              <div className="grid grid-cols-2 gap-4">
                {vehicle.color && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Color:</span>
                    <span className="font-medium">{vehicle.color}</span>
                  </div>
                )}
                {vehicle.doors && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Puertas:</span>
                    <span className="font-medium">{vehicle.doors}</span>
                  </div>
                )}
                {vehicle.engine && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Motor:</span>
                    <span className="font-medium">{vehicle.engine}</span>
                  </div>
                )}
                {vehicle.horsepower && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Potencia:</span>
                    <span className="font-medium">{vehicle.horsepower} HP</span>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {vehicle.description && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Descripción</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {vehicle.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-medium">Garantía de 3 meses o 5.000 km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="font-medium">Inspección técnica de 120 puntos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="font-medium">Financiamiento disponible</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="flex-1 gradient-mtg">
                <a href={`https://wa.me/56912345678?text=Hola, me interesa el ${vehicle.brand} ${vehicle.model} ${vehicle.year} que vi en su página`} target="_blank">
                  <Phone className="w-4 h-4 mr-2" />
                  Contactar por WhatsApp
                </a>
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                Reservar con abono
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
