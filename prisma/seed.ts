import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const brands = ['Toyota', 'Chevrolet', 'Ford', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Honda'];
const models: Record<string, string[]> = {
  Toyota: ['Corolla', 'Camry', 'RAV4', 'Hilux', 'Fortuner', 'Yaris'],
  Chevrolet: ['Cruze', 'Aveo', 'Tracker', 'D-Max', 'Equinox', 'Captiva'],
  Ford: ['Focus', 'Fiesta', 'Ranger', 'Escape', 'Explorer', 'Mustang'],
  Nissan: ['Sentra', 'Versa', 'X-Trail', 'Navara', 'Qashqai', 'Kicks'],
  Hyundai: ['Elantra', 'Accent', 'Tucson', 'Santa Fe', 'Kona', 'Creta'],
  Kia: ['Cerato', 'Rio', 'Sportage', 'Sorento', 'Seltos', 'Carnival'],
  Mazda: ['3', '6', 'CX-3', 'CX-5', 'CX-30', 'BT-50'],
  Honda: ['Civic', 'Accord', 'CR-V', 'HR-V', 'Fit', 'City'],
};

const regions = ['Metropolitana', 'Valparaíso', 'Biobío', 'Maule', "O'Higgins"];
const transmissions = ['automatic', 'manual'];
const fuelTypes = ['gasoline', 'diesel', 'electric', 'hybrid'];
const colors = ['Blanco', 'Negro', 'Gris', 'Plata', 'Rojo', 'Azul', 'Verde'];

function generateSlug(brand: string, model: string, year: number): string {
  const base = `${brand}-${model}-${year}`.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}-${random}`;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = Buffer.from('admin123').toString('base64');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mtg.cl' },
    update: {},
    create: {
      email: 'admin@mtg.cl',
      password: adminPassword,
      name: 'Admin MTG',
      role: 'admin',
      phone: '+56912345678',
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create sales user
  const salesPassword = Buffer.from('ventas123').toString('base64');
  const salesUser = await prisma.user.upsert({
    where: { email: 'ventas@mtg.cl' },
    update: {},
    create: {
      email: 'ventas@mtg.cl',
      password: salesPassword,
      name: 'Carlos Ventas',
      role: 'sales',
      phone: '+56987654321',
      isActive: true,
    },
  });
  console.log('✅ Sales user created:', salesUser.email);

  // Create vehicles
  const vehicleData = [];
  for (let i = 0; i < 20; i++) {
    const brand = randomElement(brands);
    const model = randomElement(models[brand]);
    const year = randomInt(2015, 2024);
    const price = randomInt(8000000, 45000000);
    const km = randomInt(20000, 180000);
    
    vehicleData.push({
      slug: generateSlug(brand, model, year),
      brand,
      model,
      year,
      price,
      km,
      region: randomElement(regions),
      city: 'Santiago',
      description: `Excelente ${brand} ${model} ${year} en perfectas condiciones. Mantención al día, un solo dueño.`,
      transmission: randomElement(transmissions),
      fuelType: randomElement(fuelTypes),
      color: randomElement(colors),
      doors: randomInt(4, 5),
      status: i < 15 ? 'published' : i < 18 ? 'draft' : 'reserved',
      publishedAt: i < 15 ? new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000) : null,
      createdById: admin.id,
    });
  }

  for (const data of vehicleData) {
    const vehicle = await prisma.vehicle.create({ data });
    
    // Create placeholder photos
    const photoCount = randomInt(3, 6);
    for (let j = 0; j < photoCount; j++) {
      await prisma.vehiclePhoto.create({
        data: {
          vehicleId: vehicle.id,
          url: `https://picsum.photos/seed/${vehicle.slug}-${j}/800/600`,
          orderIndex: j,
          isPrimary: j === 0,
        },
      });
    }
    
    console.log(`✅ Vehicle created: ${vehicle.brand} ${vehicle.model} (${vehicle.status})`);
  }

  // Create leads
  const leadNames = ['Juan Pérez', 'María García', 'Pedro López', 'Ana Martínez', 'Carlos Rodríguez', 'Laura Sánchez'];
  const sources = ['whatsapp', 'web', 'instagram', 'facebook', 'referral'];
  
  const vehicles = await prisma.vehicle.findMany({ where: { status: 'published' } });
  
  for (let i = 0; i < 10; i++) {
    const vehicle = randomElement(vehicles);
    await prisma.lead.create({
      data: {
        vehicleId: vehicle?.id,
        customerName: randomElement(leadNames),
        customerEmail: `cliente${i}@email.com`,
        customerPhone: `+569${randomInt(10000000, 99999999)}`,
        source: randomElement(sources),
        status: randomElement(['new', 'contacted', 'scheduled', 'closed_won', 'closed_lost']),
        notes: 'Interesado en el vehículo, solicita más información.',
      },
    });
  }
  console.log('✅ Leads created');

  // Create reservations
  const reservedVehicles = await prisma.vehicle.findMany({ where: { status: 'reserved' } });
  
  for (const vehicle of reservedVehicles) {
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await prisma.reservation.create({
      data: {
        vehicleId: vehicle.id,
        customerName: randomElement(leadNames),
        customerEmail: `reserva${randomInt(1, 100)}@email.com`,
        customerPhone: `+569${randomInt(10000000, 99999999)}`,
        amount: 50000,
        status: 'pending_payment',
        expiresAt,
        idempotencyKey: randomUUID(),
      },
    });
  }
  console.log('✅ Reservations created');

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
