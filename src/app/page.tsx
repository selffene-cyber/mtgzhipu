'use client';

import { PublicLayout } from '@/components/layout/public-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { 
  Car, 
  Search, 
  Shield, 
  Clock, 
  DollarSign,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getVehicles, getStats, API_URL } from '@/lib/api-client';

interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number | null;
  transmission: string | null;
  primaryPhoto?: string;
}

interface Stats {
  vehicles: number;
  leads: number;
  auctions: number;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<Stats>({ vehicles: 0, leads: 0, auctions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [vehiclesRes, statsRes] = await Promise.all([
          getVehicles({ limit: 12 }),
          getStats()
        ]);
        
        if (vehiclesRes.success && vehiclesRes.data) {
          setVehicles(vehiclesRes.data);
        }
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const featuredVehicles = vehicles.slice(0, 5);

  return (
    <PublicLayout>
      {/* Hero Section with Carousel */}
      <section className="relative gradient-mtg text-white">
        <div className="container px-4 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Zap className="w-3 h-3 mr-1" />
                Tu próxima decisión inteligente
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Encuentra tu vehículo ideal con MTG Automotora
              </h1>
              <p className="text-lg text-white/90">
                La plataforma más completa para comprar, vender y consignar vehículos. 
                Subastas, financiamiento y la mejor asesoría.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                  <Link href="/catalogo">
                    <Search className="w-4 h-4 mr-2" />
                    Ver Catálogo
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Link href="/consignar">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Consignar Vehículo
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Featured Carousel */}
            <div className="hidden lg:block">
              {featuredVehicles.length > 0 && (
                <Carousel
                  plugins={[Autoplay({ delay: 4000 })]}
                  className="w-full"
                >
                  <CarouselContent>
                    {featuredVehicles.map((vehicle) => (
                      <CarouselItem key={vehicle.id}>
                        <Card className="overflow-hidden bg-white/10 backdrop-blur border-0">
                          <div className="aspect-[4/3] relative">
                            <img
                              src={vehicle.primaryPhoto || `https://picsum.photos/seed/${vehicle.slug}/800/600`}
                              alt={`${vehicle.brand} ${vehicle.model}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                              <p className="text-white font-bold text-xl">
                                {vehicle.brand} {vehicle.model}
                              </p>
                              <p className="text-white/90">
                                {vehicle.year} • {formatPrice(vehicle.price)}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-muted/30 border-y">
        <div className="container px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">{stats.vehicles}+</p>
              <p className="text-sm text-muted-foreground">Vehículos disponibles</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">{stats.leads}+</p>
              <p className="text-sm text-muted-foreground">Clientes satisfechos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">{stats.auctions}</p>
              <p className="text-sm text-muted-foreground">Subastas activas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles Grid */}
      <section className="py-12">
        <div className="container px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold">Vehículos Destacados</h2>
              <p className="text-muted-foreground">Explora nuestra selección de vehículos</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/catalogo">
                Ver todos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-[4/3] bg-muted animate-pulse" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vehicles.slice(0, 8).map((vehicle) => (
                <Link key={vehicle.id} href={`/vehiculo/${vehicle.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-[4/3] relative">
                      <img
                        src={vehicle.primaryPhoto || `https://picsum.photos/seed/${vehicle.slug}/800/600`}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                      {vehicle.transmission && (
                        <Badge className="absolute top-2 right-2" variant="secondary">
                          {vehicle.transmission === 'automatic' ? 'Automático' : 'Manual'}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <p className="font-semibold text-lg">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {vehicle.year} • {vehicle.km ? `${vehicle.km.toLocaleString()} km` : 'Sin info'}
                      </p>
                      <p className="font-bold text-primary text-xl mt-2">
                        {formatPrice(vehicle.price)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-muted/30">
        <div className="container px-4">
          <h2 className="text-2xl font-bold text-center mb-8">¿Por qué elegirnos?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Garantía Incluida</h3>
                <p className="text-sm text-muted-foreground">
                  Todos nuestros vehículos incluyen garantía de 3 meses o 5.000 km
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Amplio Stock</h3>
                <p className="text-sm text-muted-foreground">
                  Más de {stats.vehicles} vehículos disponibles en diversas categorías
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Financiamiento</h3>
                <p className="text-sm text-muted-foreground">
                  Opciones de crédito automotriz con las mejores tasas del mercado
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Atención Rápida</h3>
                <p className="text-sm text-muted-foreground">
                  Respuesta inmediata por WhatsApp y agendamiento de pruebas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="container px-4">
          <Card className="gradient-mtg text-white overflow-hidden">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">¿Tienes un vehículo para vender?</h2>
              <p className="mb-6 max-w-2xl mx-auto">
                Consígnalo con nosotros y obtén el mejor precio. Sin complicaciones, 
                con asesoría completa y venta garantizada.
              </p>
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/consignar">
                  Consignar ahora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
