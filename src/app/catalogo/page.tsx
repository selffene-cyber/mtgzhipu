'use client';

import { PublicLayout } from '@/components/layout/public-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Search, SlidersHorizontal, Car, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getVehicles } from '@/lib/api-client';

interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number | null;
  transmission: string | null;
  fuelType: string | null;
  region: string | null;
  primaryPhoto?: string;
}

const brands = ['Toyota', 'Honda', 'Mazda', 'Hyundai', 'Kia', 'Nissan', 'Volkswagen', 'Ford', 'Chevrolet', 'Suzuki', 'Renault', 'Peugeot', 'Mercedes-Benz', 'BMW', 'Audi', 'Tesla'];
const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
const transmissions = [
  { value: 'automatic', label: 'Automática' },
  { value: 'manual', label: 'Manual' },
];
const fuelTypes = [
  { value: 'gasoline', label: 'Bencina' },
  { value: 'diesel', label: 'Diésel' },
  { value: 'electric', label: 'Eléctrico' },
  { value: 'hybrid', label: 'Híbrido' },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function CatalogoPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('');
  const [selectedFuelType, setSelectedFuelType] = useState<string>('');
  const [priceRange, setPriceRange] = useState([0, 50000000]);

  useEffect(() => {
    fetchVehicles();
  }, []);

  async function fetchVehicles() {
    setLoading(true);
    try {
      const result = await getVehicles();
      if (result.success && result.data) {
        setVehicles(result.data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!v.brand.toLowerCase().includes(query) && 
          !v.model.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (selectedBrand && v.brand !== selectedBrand) return false;
    if (selectedYear && v.year.toString() !== selectedYear) return false;
    if (selectedTransmission && v.transmission !== selectedTransmission) return false;
    if (selectedFuelType && v.fuelType !== selectedFuelType) return false;
    if (v.price < priceRange[0] || v.price > priceRange[1]) return false;
    return true;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBrand('');
    setSelectedYear('');
    setSelectedTransmission('');
    setSelectedFuelType('');
    setPriceRange([0, 50000000]);
  };

  const activeFiltersCount = [
    selectedBrand,
    selectedYear,
    selectedTransmission,
    selectedFuelType,
  ].filter(Boolean).length;

  return (
    <PublicLayout>
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Catálogo de Vehículos</h1>
          <p className="text-muted-foreground">
            {filteredVehicles.length} vehículos disponibles
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por marca o modelo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 py-6">
                {/* Brand */}
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las marcas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las marcas</SelectItem>
                      {brands.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <Label>Año</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los años" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los años</SelectItem>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Transmission */}
                <div className="space-y-2">
                  <Label>Transmisión</Label>
                  <Select value={selectedTransmission} onValueChange={setSelectedTransmission}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      {transmissions.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fuel Type */}
                <div className="space-y-2">
                  <Label>Combustible</Label>
                  <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {fuelTypes.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <Label>
                    Precio: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={50000000}
                    step={1000000}
                    className="w-full"
                  />
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <Button variant="outline" className="w-full" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Results */}
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
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron vehículos</h3>
            <p className="text-muted-foreground mb-4">
              Intenta ajustar los filtros de búsqueda
            </p>
            <Button onClick={clearFilters}>Limpiar filtros</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVehicles.map((vehicle) => (
              <Link key={vehicle.id} href={`/vehiculo/${vehicle.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
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
                    <p className="font-semibold text-lg line-clamp-1">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {vehicle.year} • {vehicle.km ? `${vehicle.km.toLocaleString()} km` : 'Sin info'}
                    </p>
                    {vehicle.region && (
                      <p className="text-muted-foreground text-sm">
                        {vehicle.region}
                      </p>
                    )}
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
    </PublicLayout>
  );
}
