export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Validation schema for creating vehicle
const createVehicleSchema = z.object({
  brand: z.string().min(1, 'Marca es requerida'),
  model: z.string().min(1, 'Modelo es requerido'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().int().positive('Precio debe ser positivo'),
  km: z.number().int().nonnegative().optional(),
  vin: z.string().optional(),
  plate: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  description: z.string().optional(),
  transmission: z.enum(['automatic', 'manual']).optional(),
  fuelType: z.enum(['gasoline', 'diesel', 'electric', 'hybrid']).optional(),
  color: z.string().optional(),
  doors: z.number().int().min(2).max(5).optional(),
  engine: z.string().optional(),
  horsepower: z.number().int().positive().optional(),
  status: z.enum(['draft', 'published', 'hidden', 'reserved', 'sold', 'archived']).default('draft'),
  isConsignment: z.boolean().default(false),
  purchasePrice: z.number().int().nonnegative().optional(),
});

// Generate slug from brand, model, year
function generateSlug(brand: string, model: string, year: number): string {
  const base = `${brand}-${model}-${year}`.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}-${random}`;
}

// GET /api/vehicles - List vehicles with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filters
    const status = searchParams.get('status');
    const brand = searchParams.get('brand');
    const model = searchParams.get('model');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minYear = searchParams.get('minYear');
    const maxYear = searchParams.get('maxYear');
    const region = searchParams.get('region');
    const transmission = searchParams.get('transmission');
    const fuelType = searchParams.get('fuelType');
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (status) {
      where.status = status;
    } else {
      // By default, only show published vehicles for public API
      where.status = 'published';
    }
    
    if (brand) where.brand = { contains: brand, mode: 'insensitive' };
    if (model) where.model = { contains: model, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice);
      if (maxPrice) where.price.lte = parseInt(maxPrice);
    }
    if (minYear || maxYear) {
      where.year = {};
      if (minYear) where.year.gte = parseInt(minYear);
      if (maxYear) where.year.lte = parseInt(maxYear);
    }
    if (region) where.region = { contains: region, mode: 'insensitive' };
    if (transmission) where.transmission = transmission;
    if (fuelType) where.fuelType = fuelType;

    // Get vehicles with photos
    const [vehicles, total] = await Promise.all([
      db.vehicle.findMany({
        where,
        include: {
          photos: {
            orderBy: { orderIndex: 'asc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.vehicle.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener vehículos' },
      { status: 500 }
    );
  }
}

// POST /api/vehicles - Create vehicle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createVehicleSchema.parse(body);

    // Generate slug
    const slug = generateSlug(validated.brand, validated.model, validated.year);

    // Check slug uniqueness
    const existing = await db.vehicle.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un vehículo con estos datos' },
        { status: 400 }
      );
    }

    const vehicle = await db.vehicle.create({
      data: {
        slug,
        brand: validated.brand,
        model: validated.model,
        year: validated.year,
        price: validated.price,
        km: validated.km,
        vin: validated.vin,
        plate: validated.plate,
        region: validated.region,
        city: validated.city,
        description: validated.description,
        transmission: validated.transmission,
        fuelType: validated.fuelType,
        color: validated.color,
        doors: validated.doors,
        engine: validated.engine,
        horsepower: validated.horsepower,
        status: validated.status,
        isConsignment: validated.isConsignment,
        purchasePrice: validated.purchasePrice,
        publishedAt: validated.status === 'published' ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, data: vehicle }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear vehículo' },
      { status: 500 }
    );
  }
}
