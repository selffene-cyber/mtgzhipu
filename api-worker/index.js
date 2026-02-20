// MTG Automotora - API Worker para Cloudflare D1 + R2
// Versión completa con todos los endpoints

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // ==================== VEHÍCULOS ====================
      if (path === '/api/vehicles' && method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const brand = url.searchParams.get('brand');
        const minPrice = url.searchParams.get('minPrice');
        const maxPrice = url.searchParams.get('maxPrice');
        const year = url.searchParams.get('year');
        const transmission = url.searchParams.get('transmission');
        const fuelType = url.searchParams.get('fuelType');
        
        let sql = `
          SELECT v.*, 
            (SELECT url FROM VehiclePhoto WHERE vehicleId = v.id ORDER BY orderIndex LIMIT 1) as primaryPhoto
          FROM Vehicle v
          WHERE v.status = 'published'
        `;
        const params = [];
        
        if (brand) { sql += ' AND v.brand = ?'; params.push(brand); }
        if (minPrice) { sql += ' AND v.price >= ?'; params.push(parseInt(minPrice)); }
        if (maxPrice) { sql += ' AND v.price <= ?'; params.push(parseInt(maxPrice)); }
        if (year) { sql += ' AND v.year = ?'; params.push(parseInt(year)); }
        if (transmission) { sql += ' AND v.transmission = ?'; params.push(transmission); }
        if (fuelType) { sql += ' AND v.fuelType = ?'; params.push(fuelType); }
        
        sql += ' ORDER BY v.createdAt DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const stmt = env.DB.prepare(sql);
        const query = params.length > 2 ? stmt.bind(...params) : stmt;
        const { results } = await query.all();
        
        // Get total count
        const countResult = await env.DB.prepare(`SELECT COUNT(*) as total FROM Vehicle WHERE status = 'published'`).first();
        
        return json({ success: true, data: results, total: countResult.total }, corsHeaders);
      }

      if (path === '/api/vehicles' && method === 'POST') {
        const data = await request.json();
        const id = crypto.randomUUID();
        const slug = `${data.brand}-${data.model}-${data.year}-${Date.now()}`.toLowerCase().replace(/\s+/g, '-');
        
        await env.DB.prepare(`
          INSERT INTO Vehicle (id, slug, brand, model, year, price, km, transmission, fuelType, color, doors, engine, horsepower, region, city, description, status, publishedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', datetime('now'))
        `).bind(id, slug, data.brand, data.model, data.year, data.price, data.km, data.transmission, data.fuelType, data.color, data.doors, data.engine, data.horsepower, data.region, data.city, data.description).run();
        
        return json({ success: true, data: { id, slug } }, corsHeaders, 201);
      }

      if (path.startsWith('/api/vehicles/') && method === 'GET') {
        const slug = path.split('/')[3];
        const vehicle = await env.DB.prepare(`
          SELECT * FROM Vehicle WHERE slug = ?
        `).bind(slug).first();
        
        if (!vehicle) {
          return json({ success: false, error: 'Vehículo no encontrado' }, corsHeaders, 404);
        }
        
        const { results: photos } = await env.DB.prepare(`
          SELECT url, orderIndex FROM VehiclePhoto WHERE vehicleId = ? ORDER BY orderIndex
        `).bind(vehicle.id).all();
        
        vehicle.photos = photos;
        return json({ success: true, data: vehicle }, corsHeaders);
      }

      if (path.startsWith('/api/vehicles/') && method === 'PUT') {
        const id = path.split('/')[3];
        const data = await request.json();
        
        await env.DB.prepare(`
          UPDATE Vehicle SET 
            brand = ?, model = ?, year = ?, price = ?, km = ?, transmission = ?, fuelType = ?,
            color = ?, doors = ?, engine = ?, horsepower = ?, region = ?, city = ?, description = ?,
            status = ?, updatedAt = datetime('now')
          WHERE id = ?
        `).bind(data.brand, data.model, data.year, data.price, data.km, data.transmission, data.fuelType, data.color, data.doors, data.engine, data.horsepower, data.region, data.city, data.description, data.status, id).run();
        
        return json({ success: true }, corsHeaders);
      }

      // ==================== UPLOAD R2 ====================
      if (path === '/api/upload' && method === 'POST') {
        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'vehicles';
        
        if (!file) {
          return json({ success: false, error: 'No file provided' }, corsHeaders, 400);
        }
        
        const ext = file.name.split('.').pop() || 'jpg';
        const key = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        
        await env.BUCKET.put(key, file.stream(), {
          httpMetadata: { contentType: file.type },
        });
        
        // Generate public URL (you need to configure R2 public access)
        const publicUrl = `https://pub-r2.mtgautomotora.cl/${key}`;
        return json({ success: true, url: publicUrl, key }, corsHeaders);
      }

      // ==================== LEADS ====================
      if (path === '/api/leads' && method === 'GET') {
        const { results } = await env.DB.prepare(`
          SELECT l.*, v.brand, v.model, v.year
          FROM Lead l
          LEFT JOIN Vehicle v ON l.vehicleId = v.id
          ORDER BY l.createdAt DESC
        `).all();
        return json({ success: true, data: results }, corsHeaders);
      }

      if (path === '/api/leads' && method === 'POST') {
        const data = await request.json();
        const id = crypto.randomUUID();
        await env.DB.prepare(`
          INSERT INTO Lead (id, vehicleId, customerName, customerEmail, customerPhone, source, status, notes)
          VALUES (?, ?, ?, ?, ?, ?, 'new', ?)
        `).bind(id, data.vehicleId, data.customerName, data.customerEmail, data.customerPhone, data.source, data.notes).run();
        return json({ success: true, data: { id } }, corsHeaders, 201);
      }

      if (path.startsWith('/api/leads/') && method === 'PUT') {
        const id = path.split('/')[3];
        const data = await request.json();
        
        await env.DB.prepare(`
          UPDATE Lead SET 
            status = ?, notes = ?, lastContactAt = ?, nextFollowUpAt = ?, updatedAt = datetime('now')
          WHERE id = ?
        `).bind(data.status, data.notes, data.lastContactAt, data.nextFollowUpAt, id).run();
        
        return json({ success: true }, corsHeaders);
      }

      // ==================== AUTH ====================
      if (path === '/api/auth/login' && method === 'POST') {
        const { email, password } = await request.json();
        const user = await env.DB.prepare(`
          SELECT id, email, name, role FROM User WHERE email = ? AND password = ? AND isActive = 1
        `).bind(email, password).first();
        
        if (!user) {
          return json({ success: false, error: 'Credenciales inválidas' }, corsHeaders, 401);
        }
        
        // Update lastLogin
        await env.DB.prepare(`UPDATE User SET lastLogin = datetime('now') WHERE id = ?`).bind(user.id).run();
        
        return json({ success: true, user }, corsHeaders);
      }

      if (path === '/api/auth/register' && method === 'POST') {
        const data = await request.json();
        const id = crypto.randomUUID();
        
        try {
          await env.DB.prepare(`
            INSERT INTO User (id, email, password, name, role)
            VALUES (?, ?, ?, ?, 'sales')
          `).bind(id, data.email, data.password, data.name).run();
          
          return json({ success: true, data: { id } }, corsHeaders, 201);
        } catch (error) {
          return json({ success: false, error: 'Email ya registrado' }, corsHeaders, 400);
        }
      }

      // ==================== STATS ====================
      if (path === '/api/stats' && method === 'GET') {
        const vehicles = await env.DB.prepare(`SELECT COUNT(*) as count FROM Vehicle WHERE status = 'published'`).first();
        const leads = await env.DB.prepare(`SELECT COUNT(*) as count FROM Lead`).first();
        const leadsNew = await env.DB.prepare(`SELECT COUNT(*) as count FROM Lead WHERE status = 'new'`).first();
        const auctions = await env.DB.prepare(`SELECT COUNT(*) as count FROM Auction WHERE status = 'active'`).first();
        const reservations = await env.DB.prepare(`SELECT COUNT(*) as count FROM Reservation`).first();
        
        return json({
          success: true,
          data: {
            vehicles: vehicles.count,
            leads: leads.count,
            leadsNew: leadsNew.count,
            auctions: auctions.count,
            reservations: reservations.count
          }
        }, corsHeaders);
      }

      // ==================== AUCTIONS ====================
      if (path === '/api/auctions' && method === 'GET') {
        const { results } = await env.DB.prepare(`
          SELECT a.*, v.brand, v.model, v.year, v.slug,
            (SELECT url FROM VehiclePhoto WHERE vehicleId = v.id ORDER BY orderIndex LIMIT 1) as primaryPhoto,
            (SELECT MAX(amount) FROM Bid WHERE auctionId = a.id) as currentBid,
            (SELECT COUNT(*) FROM Bid WHERE auctionId = a.id) as bidCount
          FROM Auction a
          JOIN Vehicle v ON a.vehicleId = v.id
          ORDER BY a.endTime ASC
        `).all();
        return json({ success: true, data: results }, corsHeaders);
      }

      if (path.startsWith('/api/auctions/') && !path.includes('/bid') && method === 'GET') {
        const id = path.split('/')[3];
        const auction = await env.DB.prepare(`
          SELECT a.*, v.brand, v.model, v.year, v.description, v.km, v.transmission, v.fuelType,
            (SELECT url FROM VehiclePhoto WHERE vehicleId = v.id ORDER BY orderIndex LIMIT 1) as primaryPhoto
          FROM Auction a
          JOIN Vehicle v ON a.vehicleId = v.id
          WHERE a.id = ?
        `).bind(id).first();
        
        if (!auction) {
          return json({ success: false, error: 'Subasta no encontrada' }, corsHeaders, 404);
        }
        
        const { results: bids } = await env.DB.prepare(`
          SELECT b.*, u.name as bidderName
          FROM Bid b
          LEFT JOIN User u ON b.userId = u.id
          WHERE b.auctionId = ?
          ORDER BY b.amount DESC
          LIMIT 10
        `).bind(id).all();
        
        auction.bids = bids;
        return json({ success: true, data: auction }, corsHeaders);
      }

      if (path.includes('/bid') && method === 'POST') {
        const parts = path.split('/');
        const auctionId = parts[3];
        const { amount, userId } = await request.json();
        const id = crypto.randomUUID();
        
        await env.DB.prepare(`
          INSERT INTO Bid (id, auctionId, userId, amount)
          VALUES (?, ?, ?, ?)
        `).bind(id, auctionId, userId, amount).run();
        
        return json({ success: true, data: { id, amount } }, corsHeaders, 201);
      }

      // ==================== CONSIGNMENTS ====================
      if (path === '/api/consignments' && method === 'GET') {
        const { results } = await env.DB.prepare(`
          SELECT c.*, v.slug as vehicleSlug
          FROM Consignment c
          LEFT JOIN Vehicle v ON c.vehicleId = v.id
          ORDER BY c.createdAt DESC
        `).all();
        return json({ success: true, data: results }, corsHeaders);
      }

      if (path === '/api/consignments' && method === 'POST') {
        const data = await request.json();
        const id = crypto.randomUUID();
        
        await env.DB.prepare(`
          INSERT INTO Consignment (id, ownerName, ownerEmail, ownerPhone, ownerRut, brand, model, year, km, expectedPrice, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received')
        `).bind(id, data.ownerName, data.ownerEmail, data.ownerPhone, data.ownerRut, data.brand, data.model, data.year, data.km, data.expectedPrice).run();
        
        return json({ success: true, data: { id } }, corsHeaders, 201);
      }

      if (path.startsWith('/api/consignments/') && method === 'PUT') {
        const id = path.split('/')[3];
        const data = await request.json();
        
        await env.DB.prepare(`
          UPDATE Consignment SET 
            status = ?, reviewedAt = datetime('now'), rejectionReason = ?, commissionPct = ?, agreedPrice = ?, updatedAt = datetime('now')
          WHERE id = ?
        `).bind(data.status, data.rejectionReason, data.commissionPct, data.agreedPrice, id).run();
        
        return json({ success: true }, corsHeaders);
      }

      // ==================== RESERVATIONS ====================
      if (path === '/api/reservations' && method === 'GET') {
        const { results } = await env.DB.prepare(`
          SELECT r.*, v.brand, v.model, v.year, v.slug
          FROM Reservation r
          JOIN Vehicle v ON r.vehicleId = v.id
          ORDER BY r.createdAt DESC
        `).all();
        return json({ success: true, data: results }, corsHeaders);
      }

      if (path === '/api/reservations' && method === 'POST') {
        const data = await request.json();
        const id = crypto.randomUUID();
        const idempotencyKey = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours
        
        await env.DB.prepare(`
          INSERT INTO Reservation (id, vehicleId, customerName, customerEmail, customerPhone, customerRut, amount, paymentMethod, status, expiresAt, idempotencyKey)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment', ?, ?)
        `).bind(id, data.vehicleId, data.customerName, data.customerEmail, data.customerPhone, data.customerRut, data.amount, data.paymentMethod, expiresAt, idempotencyKey).run();
        
        return json({ success: true, data: { id, idempotencyKey } }, corsHeaders, 201);
      }

      if (path.startsWith('/api/reservations/') && method === 'PUT') {
        const id = path.split('/')[3];
        const data = await request.json();
        
        await env.DB.prepare(`
          UPDATE Reservation SET 
            status = ?, confirmedAt = datetime('now'), updatedAt = datetime('now')
          WHERE id = ?
        `).bind(data.status, id).run();
        
        return json({ success: true }, corsHeaders);
      }

      // ==================== RECENT ITEMS ====================
      if (path === '/api/recent' && method === 'GET') {
        const { results: recentLeads } = await env.DB.prepare(`
          SELECT l.*, v.brand, v.model
          FROM Lead l
          LEFT JOIN Vehicle v ON l.vehicleId = v.id
          ORDER BY l.createdAt DESC
          LIMIT 5
        `).all();
        
        const { results: recentVehicles } = await env.DB.prepare(`
          SELECT v.*, (SELECT url FROM VehiclePhoto WHERE vehicleId = v.id ORDER BY orderIndex LIMIT 1) as primaryPhoto
          FROM Vehicle v
          WHERE v.status = 'published'
          ORDER BY v.createdAt DESC
          LIMIT 5
        `).all();
        
        const { results: recentReservations } = await env.DB.prepare(`
          SELECT r.*, v.brand, v.model
          FROM Reservation r
          JOIN Vehicle v ON r.vehicleId = v.id
          ORDER BY r.createdAt DESC
          LIMIT 5
        `).all();
        
        return json({
          success: true,
          data: {
            leads: recentLeads,
            vehicles: recentVehicles,
            reservations: recentReservations
          }
        }, corsHeaders);
      }

      // Default: 404
      return json({ success: false, error: 'Not found' }, corsHeaders, 404);

    } catch (error) {
      console.error('API Error:', error);
      return json({ success: false, error: error.message }, corsHeaders, 500);
    }
  }
};

function json(data, headers, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}
