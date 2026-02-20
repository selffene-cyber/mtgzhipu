'use client';

import { PublicLayout } from '@/components/layout/public-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { 
  Car, 
  Search, 
  Filter, 
  Grid, 
  List, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useDebounce } from '@reactuses/core';

interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number | null;
  region: string | null;
  transmission: string | null;
  fuelType: string | null;
  photos: { url: string }[];
}

interface Filters {
  search: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  transmission: string;
  fuelType: string;
  region: string;
}

const brands = ['Toyota', 'Chevrolet', 'Ford', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Honda', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi'];
const regions = ['Metropolitana', 'Valparaíso', 'Biobío', 'Maule', 'O\'Higgins', 'Araucanía'];
const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

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

export default function CatalogoPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    brand: '',
    minPrice: 0,
    maxPrice: 100000000,
    minYear: 1995,
    maxYear: new Date().getFullYear(),
    transmission: '',
    fuelType: '',
    region: '',
  });

  const debouncedSearch = useDebounce(filters.search, 300);

  const fetchVehicles = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '12');
      
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filters.brand) params.set('brand', filters.brand);
      if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice < 100000000) params.set('maxPrice', filters.maxPrice.toString());
      if (filters.minYear > 1995) params.set('minYear', filters.minYear.toString());
      if (filters.maxYear < new Date().getFullYear()) params.set('maxYear', filters.maxYear.toString());
      if (filters.transmission) params.set('transmission', filters.transmission);
      if (filters.fuelType) params.set('fuelType', filters.fuelType);
      if (filters.region) params.set('region', filters.region);

      const res = await fetch(`/api/vehicles?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setVehicles(data.data);
        setPagination({
          page: data.pagination.page,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        });
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters]);

  useEffect(() => {
    fetchVehicles(1);
  }, [fetchVehicles]);

  const clearFilters = () => {
    setFilters({
      search: '',
      brand: '',
      minPrice: 0,
      maxPrice: 100000000,
      minYear: 1995,
      maxYear: new Date().getFullYear(),
      transmission: '',
      fuelType: '',
      region: '',
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'minPrice') return value > 0;
    if (key === 'maxPrice') return value < 100000000;
    if (key === 'minYear') return value > 1995;
    if (key === 'maxYear') return value < new Date().getFullYear();
    return value !== '';
  });

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label>Buscar</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Marca, modelo..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>

      {/* Brand */}
      <div className="space-y-2">
        <Label>Marca</Label>
        <Select value={filters.brand} onValueChange={(v) => setFilters({ ...filters, brand: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Todas las marcas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand.toLowerCase()}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year Range */}
      <div className="space-y-2">
        <Label>Año: {filters.minYear} - {filters.maxYear}</Label>
        <div className="flex gap-2">
          <Select 
            value={filters.minYear.toString()} 
            onValueChange={(v) => setFilters({ ...filters, minYear: parseInt(v) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select 
            value={filters.maxYear.toString()} 
            onValueChange={(v) => setFilters({ ...filters, maxYear: parseInt(v) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label>
          Precio: {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
        </Label>
        <Slider
          value={[filters.minPrice, filters.maxPrice]}
          onValueChange={([min, max]) => setFilters({ ...filters, minPrice: min, maxPrice: max })}
          max={100000000}
          step={1000000}
          className="mt-2"
        />
      </div>

      {/* Transmission */}
      <div className="space-y-2">
        <Label>Transmisión</Label>
        <Select 
          value={filters.transmission} 
          onValueChange={(v) => setFilters({ ...filters, transmission: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            <SelectItem value="automatic">Automática</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fuel Type */}
      <div className="space-y-2">
        <Label>Combustible</Label>
        <Select 
          value={filters.fuelType} 
          onValueChange={(v) => setFilters({ ...filters, fuelType: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="gasoline">Bencina</SelectItem>
            <SelectItem value="diesel">Diésel</SelectItem>
            <SelectItem value="electric">Eléctrico</SelectItem>
            <SelectItem value="hybrid">Híbrido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Region */}
      <div className="space-y-2">
        <Label>Región</Label>
        <Select 
          value={filters.region} 
          onValueChange={(v) => setFilters({ ...filters, region: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region} value={region.toLowerCase()}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="w-4 h-4 mr-2" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  return (
    <PublicLayout>
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Catálogo de Vehículos</h1>
            <p className="text-muted-foreground">
              {pagination.total} vehículos disponibles
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop Filters */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  {hasActiveFilters && (
                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">!</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            {/* View Mode Toggle */}
            <div className="hidden md:flex border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-72 shrink-0">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Filtros</h3>
                <FilterContent />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
            ) : vehicles.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No se encontraron vehículos</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Intenta ajustar los filtros de búsqueda
                  </p>
                  <Button onClick={clearFilters}>Limpiar filtros</Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6' 
                  : 'space-y-4'
                }>
                  {vehicles.map((vehicle) => (
                    <Link key={vehicle.id} href={`/vehiculo/${vehicle.slug}`}>
                      <Card className={`overflow-hidden card-hover cursor-pointer group ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}>
                        <div className={`relative bg-muted ${
                          viewMode === 'list' ? 'w-48 shrink-0' : 'aspect-[4/3]'
                        }`}>
                          {vehicle.photos[0]?.url ? (
                            <img
                              src={vehicle.photos[0].url}
                              alt={`${vehicle.brand} ${vehicle.model}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="w-12 h-12 text-muted-foreground/30" />
                            </div>
                          )}
                          <Badge className="absolute top-3 left-3" variant="secondary">
                            {vehicle.year}
                          </Badge>
                        </div>
                        <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                          <h3 className="font-semibold text-lg">
                            {vehicle.brand} {vehicle.model}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                            <span>{formatKm(vehicle.km)}</span>
                            {vehicle.transmission && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{vehicle.transmission === 'automatic' ? 'Automática' : 'Manual'}</span>
                              </>
                            )}
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

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => fetchVehicles(pagination.page - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => fetchVehicles(pagination.page + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
