'use client';

import { PublicLayout } from '@/components/layout/public-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Gavel, 
  Clock, 
  TrendingUp, 
  Eye,
  Play,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAuctions } from '@/lib/api-client';

interface Auction {
  id: string;
  status: string;
  startingPrice: number;
  minIncrement: number;
  depositAmount: number;
  startTime: Date;
  endTime: Date;
  highestBid: number;
  bidCount: number;
  vehicle: {
    brand: string;
    model: string;
    year: number;
    photos: { url: string }[];
  };
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price);
}

function getTimeRemaining(endTime: Date): string {
  const now = new Date();
  const diff = new Date(endTime).getTime() - now.getTime();
  
  if (diff <= 0) return 'Finalizada';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  ended_pending_payment: 'bg-yellow-100 text-yellow-700',
  closed_won: 'bg-purple-100 text-purple-700',
  closed_failed: 'bg-red-100 text-red-700',
};

export default function SubastasPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAuctions() {
      try {
        const data = await getAuctions();
        if (data.success && data.data) {
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

  return (
    <PublicLayout>
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Gavel className="w-3 h-3 mr-1" />
            Subastas en Vivo
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Subastas de Vehículos</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Participa en nuestras subastas y consigue el vehículo de tus sueños al mejor precio
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{auctions.filter(a => a.status === 'active').length}</p>
              <p className="text-sm text-muted-foreground">Subastas Activas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{auctions.filter(a => a.status === 'scheduled').length}</p>
              <p className="text-sm text-muted-foreground">Programadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{auctions.reduce((acc, a) => acc + a.bidCount, 0)}</p>
              <p className="text-sm text-muted-foreground">Pujas Totales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">5 min</p>
              <p className="text-sm text-muted-foreground">Anti-sniping</p>
            </CardContent>
          </Card>
        </div>

        {/* Auctions Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : auctions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Gavel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No hay subastas activas</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Pronto tendrás nuevas oportunidades de pujar
              </p>
              <Button asChild>
                <Link href="/catalogo">Ver catálogo</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <Link key={auction.id} href={`/subastas/${auction.id}`}>
                <Card className="overflow-hidden card-hover group cursor-pointer">
                  <div className="aspect-video relative bg-muted">
                    {auction.vehicle.photos[0]?.url ? (
                      <img
                        src={auction.vehicle.photos[0].url}
                        alt={`${auction.vehicle.brand} ${auction.vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <Gavel className="w-16 h-16 text-primary/30" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <Badge className={`absolute top-3 left-3 ${statusColors[auction.status]}`}>
                      {auction.status === 'active' && <Play className="w-3 h-3 mr-1" />}
                      {auction.status === 'scheduled' && <Clock className="w-3 h-3 mr-1" />}
                      {auction.status}
                    </Badge>

                    {/* Timer */}
                    {auction.status === 'active' && (
                      <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeRemaining(auction.endTime)}
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">
                      {auction.vehicle.brand} {auction.vehicle.model} ({auction.vehicle.year})
                    </h3>

                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Precio inicial</span>
                        <span className="font-medium">{formatPrice(auction.startingPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Puja actual</span>
                        <span className="font-bold text-primary text-lg">{formatPrice(auction.highestBid)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Pujas</span>
                        <span className="font-medium">{auction.bidCount}</span>
                      </div>
                    </div>

                    {auction.status === 'active' && (
                      <Button className="w-full mt-4 gradient-mtg">
                        <Gavel className="w-4 h-4 mr-2" />
                        Pujar
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* How it works */}
        <Card className="mt-12 bg-muted/50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">¿Cómo funcionan las subastas?</h3>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: 1, title: 'Encuentra', desc: 'Busca una subasta activa de tu interés' },
                { step: 2, title: 'Puja', desc: 'Ingresa tu oferta mayor al precio actual' },
                { step: 3, title: 'Gana', desc: 'Si eres el mejor postor al cierre, ganas' },
                { step: 4, title: 'Paga', desc: 'Deposita el monto en 24h y llévate el auto' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-2 font-bold">
                    {item.step}
                  </div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
