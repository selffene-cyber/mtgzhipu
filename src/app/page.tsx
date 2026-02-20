'use client';

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
import Autoplay from 'embla-carousel-autoplay';
import { 
  Car, 
  Search, 
  Shield, 
  Clock, 
  Phone, 
  ArrowRight, 
  Star,
  CheckCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Percent,
  Flame
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number | null;
  region: string | null;
  photos: { url: string }[];
}

// Format price in CLP
function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price);
}

// Format kilometers
function formatKm(km: number | null): string {
  if (!km) return 'N/A';
  return new Intl.NumberFormat('es-CL').format(km) + ' km';
}

// Hero Carousel Component
function HeroCarousel({ vehicles }: { vehicles: Vehicle[] }) {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));
  
  if (vehicles.length === 0) return null;
  
  return (
    <div className="relative w-full">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        opts={{ loop: true, align: 'start' }}
      >
        <CarouselContent>
          {vehicles.slice(0, 5).map((vehicle, index) => (
            <CarouselItem key={vehicle.id} className="md:basis-1/2 lg:basis-1/3">
              <Link href={`/vehiculo/${vehicle.slug}`} className="block h-full">
                <Card className="h-full overflow-hidden card-hover group border-2 border-transparent hover:border-primary/30">
                  <div className="aspect-[16/10] relative bg-muted">
                    {vehicle.photos[0]?.url ? (
                      <img
                        src={vehicle.photos[0].url}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <Car className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {index === 0 && (
                        <Badge className="bg-yellow-500 text-yellow-900 border-0">
                          <Flame className="w-3 h-3 mr-1" />
                          Más vendido
                        </Badge>
                      )}
                      {index === 1 && (
                        <Badge className="bg-red-500 text-white border-0">
                          <Percent className="w-3 h-3 mr-1" />
                          Oferta
                        </Badge>
                      )}
                      {index === 2 && (
                        <Badge className="bg-primary text-white border-0">
                          <Star className="w-3 h-3 mr-1" />
                          Destacado
                        </Badge>
                      )}
                    </div>
                    
                    {/* Price and info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-bold text-lg drop-shadow-lg">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-white/80 mb-2">
                        <span>{vehicle.year}</span>
                        <span>•</span>
                        <span>{formatKm(vehicle.km)}</span>
                      </div>
                      <p className="text-2xl font-bold drop-shadow-lg">
                        {formatPrice(vehicle.price)}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 bg-white/90 hover:bg-white border-2 border-primary/20" />
        <CarouselNext className="right-2 bg-white/90 hover:bg-white border-2 border-primary/20" />
      </Carousel>
      
      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {vehicles.slice(0, 5).map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-primary/30 hover:bg-primary transition-colors cursor-pointer"
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [carouselVehicles, setCarouselVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, sold: 0, clients: 0 });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/vehicles?limit=12');
        const data = await res.json();
        if (data.success) {
          // Shuffle for carousel (featured offers)
          const shuffled = [...data.data].sort(() => Math.random() - 0.5);
          setCarouselVehicles(shuffled.slice(0, 6));
          setFeaturedVehicles(data.data);
          setStats(prev => ({ ...prev, total: data.pagination.total }));
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <PublicLayout>
      {/* Hero Section with Carousel */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" />
        <div className="container px-4 py-8 md:py-12">
          {/* Hero Header */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              <Star className="w-3 h-3 mr-1" />
              Automotora de Confianza
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Tu próxima{' '}
              <span className="text-gradient-mtg">decisión inteligente</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Vehículos seleccionados con garantía, inspección técnica y financiamiento. 
            </p>
          </div>

          {/* Hero Carousel */}
          {!loading && carouselVehicles.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold">Ofertas y Destacados</h2>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/catalogo">
                    Ver todos
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <HeroCarousel vehicles={carouselVehicles} />
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="gradient-mtg">
              <Link href="/catalogo">
                <Search className="w-4 h-4 mr-2" />
                Ver Catálogo
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://wa.me/56912345678" target="_blank" rel="noopener noreferrer">
                <Phone className="w-4 h-4 mr-2" />
                Contactar
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur border">
              <p className="text-3xl font-bold text-primary">{stats.total}+</p>
              <p className="text-sm text-muted-foreground">Vehículos</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur border">
              <p className="text-3xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Clientes</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur border">
              <p className="text-3xl font-bold text-primary">98%</p>
              <p className="text-sm text-muted-foreground">Satisfacción</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur border">
              <p className="text-3xl font-bold text-primary">5+</p>
              <p className="text-sm text-muted-foreground">Años</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">¿Por qué elegirnos?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nos diferenciamos por nuestra transparencia, calidad y compromiso con cada cliente.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Garantía Incluida</h3>
                <p className="text-muted-foreground text-sm">
                  Todos nuestros vehículos incluyen garantía mecánica de 3 meses o 5.000 km.
                </p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Inspección Técnica</h3>
                <p className="text-muted-foreground text-sm">
                  Cada vehículo pasa por una revisión de 120 puntos antes de su venta.
                </p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Financiamiento</h3>
                <p className="text-muted-foreground text-sm">
                  Opciones de financiamiento con las mejores tasas del mercado.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-16">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Vehículos Recientes</h2>
              <p className="text-muted-foreground">Los mejores autos seleccionados para ti</p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex">
              <Link href="/catalogo">
                Ver todos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-[4/3] bg-muted animate-pulse" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredVehicles.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No hay vehículos disponibles</h3>
                <p className="text-muted-foreground text-sm">
                  Pronto tendremos nuevos vehículos en inventario.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <Link key={vehicle.id} href={`/vehiculo/${vehicle.slug}`}>
                  <Card className="overflow-hidden card-hover cursor-pointer group">
                    <div className="aspect-[4/3] relative bg-muted">
                      {vehicle.photos[0]?.url ? (
                        <img
                          src={vehicle.photos[0].url}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3" variant="secondary">
                        {vehicle.year}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>{formatKm(vehicle.km)}</span>
                        {vehicle.region && (
                          <>
                            <span>•</span>
                            <span>{vehicle.region}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xl font-bold text-primary mt-3">
                        {formatPrice(vehicle.price)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button asChild>
              <Link href="/catalogo">
                Ver todos los vehículos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Tienes un vehículo para vender?</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Consigna tu vehículo con nosotros. Nos encargamos de todo: evaluación, 
            fotografía profesional, publicación y venta.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/consignar">
                Consignar mi vehículo
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <a href="https://wa.me/56912345678" target="_blank" rel="noopener noreferrer">
                <Phone className="w-4 h-4 mr-2" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">¿Cómo funciona?</h2>
            <p className="text-muted-foreground">Proceso simple y transparente</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Search, title: 'Encuentra', desc: 'Explora nuestro catálogo y encuentra tu vehículo ideal' },
              { icon: Clock, title: 'Reserva', desc: 'Realiza una reserva con un pequeño abono' },
              { icon: Shield, title: 'Inspecciona', desc: 'Agenda una visita o videollamada para revisar el vehículo' },
              { icon: CheckCircle, title: 'Compra', desc: 'Completa el pago y llévate tu nuevo auto' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-sm font-medium text-primary mb-2">Paso {i + 1}</div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
