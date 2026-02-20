-- MTG Automotora - D1 Seed Data
-- Demo data for testing and development

-- ==================== USUARIOS ====================

INSERT INTO User (id, email, password, name, role, phone, isActive) VALUES
('user_admin', 'admin@mtg.cl', '$2a$10$rQZ9QxZ9QxZ9QxZ9QxZ9QeJ4nJ6nJ6nJ6nJ6nJ6nJ6nJ6nJ6nJ6nJ', 'Administrador MTG', 'admin', '+56912345678', 1),
('user_ventas', 'ventas@mtg.cl', '$2a$10$rQZ9QxZ9QxZ9QxZ9QxZ9QeJ4nJ6nJ6nJ6nJ6nJ6nJ6nJ6nJ6nJ6n', 'Vendedor MTG', 'sales', '+56987654321', 1);

-- ==================== VEHÍCULOS ====================

INSERT INTO Vehicle (id, slug, brand, model, year, price, km, transmission, fuelType, status, region, city, description) VALUES
('veh_001', 'toyota-corolla-2023', 'Toyota', 'Corolla', 2023, 18500000, 15000, 'automatic', 'gasoline', 'published', 'Metropolitana', 'Santiago', 'Excelente estado, único dueño, mantenciones al día.'),
('veh_002', 'honda-civic-2022', 'Honda', 'Civic', 2022, 19500000, 25000, 'automatic', 'gasoline', 'published', 'Metropolitana', 'Santiago', 'Auto impecable, full equipo, aire acondicionado.'),
('veh_003', 'mazda3-2023', 'Mazda', '3', 2023, 17900000, 12000, 'automatic', 'gasoline', 'published', 'Valparaíso', 'Viña del Mar', 'Mazda3 Sedán, tecnología SkyActiv, muy económico.'),
('veh_004', 'hyundai-tucson-2022', 'Hyundai', 'Tucson', 2022, 22500000, 30000, 'automatic', 'gasoline', 'published', 'Metropolitana', 'Santiago', 'SUV espaciosa, ideal para familia, 7 airbags.'),
('veh_005', 'kia-sportage-2023', 'Kia', 'Sportage', 2023, 23900000, 10000, 'automatic', 'gasoline', 'published', 'Metropolitana', 'Santiago', 'Nueva generación, diseño moderno, garantía vigente.'),
('veh_006', 'nissan-qashqai-2022', 'Nissan', 'Qashqai', 2022, 19900000, 28000, 'automatic', 'gasoline', 'published', 'Biobío', 'Concepción', 'SUV compacta, perfecta para ciudad y carretera.'),
('veh_007', 'volkswagen-polo-2023', 'Volkswagen', 'Polo', 2023, 14200000, 8000, 'manual', 'gasoline', 'published', 'Metropolitana', 'Santiago', 'Hatchback deportivo, motor 1.6, muy ágil.'),
('veh_008', 'ford-escape-2021', 'Ford', 'Escape', 2021, 18500000, 45000, 'automatic', 'gasoline', 'published', 'Metropolitana', 'Santiago', 'SUV robusta, tracción delantera, espaciosa.'),
('veh_009', 'chevrolet-cruze-2022', 'Chevrolet', 'Cruze', 2022, 15800000, 22000, 'automatic', 'gasoline', 'published', 'Valparaíso', 'Valparaíso', 'Sedán elegante, full equipo, ahorro de combustible.'),
('veh_010', 'suzuki-vitara-2023', 'Suzuki', 'Vitara', 2023, 17500000, 5000, 'automatic', 'gasoline', 'published', 'Metropolitana', 'Santiago', 'SUV compacta japonesa, muy confiable.'),
('veh_011', 'renault-duster-2022', 'Renault', 'Duster', 2022, 15200000, 35000, 'manual', 'gasoline', 'published', 'Metropolitana', 'Santiago', 'SUV versátil, ideal para todo terreno.'),
('veh_012', 'peugeot-2008-2023', 'Peugeot', '2008', 2023, 18900000, 6000, 'automatic', 'gasoline', 'published', 'Metropolitana', 'Santiago', 'SUV francesa, diseño premium, tecnología avanzada.'),
('veh_013', 'toyota-rav4-2022', 'Toyota', 'RAV4', 2022, 28500000, 20000, 'automatic', 'hybrid', 'published', 'Metropolitana', 'Santiago', 'Híbrida, ahorro garantizado, calidad Toyota.'),
('veh_014', 'honda-cr-v-2023', 'Honda', 'CR-V', 2023, 29900000, 3000, 'automatic', 'gasoline', 'published', 'Metropolitana', 'Santiago', 'SUV familiar, máxima seguridad, muy confortable.'),
('veh_015', 'mercedes-cla-2021', 'Mercedes-Benz', 'CLA', 2021, 32000000, 25000, 'automatic', 'gasoline', 'published', 'Metropolitana', 'Santiago', 'Sedán deportivo de lujo, AMG line.'),
('veh_016', 'bmw-serie3-2022', 'BMW', 'Serie 3', 2022, 35000000, 18000, 'automatic', 'gasoline', 'published', 'Metropolitana', 'Santiago', 'Sedán ejecutivo, BMW Connected Drive.'),
('veh_017', 'audi-a4-2021', 'Audi', 'A4', 2021, 28000000, 32000, 'automatic', 'gasoline', 'published', 'Metropolitana', 'Santiago', 'Sedán premium, Quattro, Virtual Cockpit.'),
('veh_018', 'tesla-model3-2023', 'Tesla', 'Model 3', 2023, 42000000, 5000, 'automatic', 'electric', 'published', 'Metropolitana', 'Santiago', '100% eléctrico, Autopilot, Supercharger acceso.'),
('veh_019', 'toyota-hilux-2022', 'Toyota', 'Hilux', 2022, 29500000, 40000, 'automatic', 'diesel', 'published', 'Metropolitana', 'Santiago', 'Pickup robusta, 4x2, ideal trabajo pesado.'),
('veh_020', 'ford-ranger-2023', 'Ford', 'Ranger', 2023, 31500000, 15000, 'automatic', 'diesel', 'published', 'Metropolitana', 'Santiago', 'Pickup moderna, Wildtrak, full equipo.');

-- ==================== FOTOS DE VEHÍCULOS ====================

INSERT INTO VehiclePhoto (id, vehicleId, url, orderIndex, isPrimary) VALUES
('photo_001', 'veh_001', 'https://picsum.photos/seed/toyota1/800/600', 0, 1),
('photo_002', 'veh_001', 'https://picsum.photos/seed/toyota2/800/600', 1, 0),
('photo_003', 'veh_002', 'https://picsum.photos/seed/honda1/800/600', 0, 1),
('photo_004', 'veh_003', 'https://picsum.photos/seed/mazda1/800/600', 0, 1),
('photo_005', 'veh_004', 'https://picsum.photos/seed/hyundai1/800/600', 0, 1),
('photo_006', 'veh_005', 'https://picsum.photos/seed/kia1/800/600', 0, 1),
('photo_007', 'veh_006', 'https://picsum.photos/seed/nissan1/800/600', 0, 1),
('photo_008', 'veh_007', 'https://picsum.photos/seed/vw1/800/600', 0, 1),
('photo_009', 'veh_008', 'https://picsum.photos/seed/ford1/800/600', 0, 1),
('photo_010', 'veh_009', 'https://picsum.photos/seed/chevy1/800/600', 0, 1);

-- ==================== LEADS ====================

INSERT INTO Lead (id, vehicleId, customerName, customerEmail, customerPhone, source, status, notes) VALUES
('lead_001', 'veh_001', 'Juan Pérez', 'juan.perez@email.com', '+56911111111', 'web', 'new', 'Interesado en financiamiento'),
('lead_002', 'veh_002', 'María García', 'maria.garcia@email.com', '+56922222222', 'whatsapp', 'contacted', 'Pidió prueba de manejo'),
('lead_003', 'veh_003', 'Carlos López', 'carlos.lopez@email.com', '+56933333333', 'web', 'scheduled', 'Cita agendada para el viernes'),
('lead_004', 'veh_004', 'Ana Martínez', 'ana.martinez@email.com', '+56944444444', 'instagram', 'new', 'Consulta por permiso de circulación'),
('lead_005', 'veh_005', 'Pedro Sánchez', 'pedro.sanchez@email.com', '+56955555555', 'web', 'contacted', 'Interesado en permuta'),
('lead_006', 'veh_013', 'Laura Fernández', 'laura.fernandez@email.com', '+56966666666', 'whatsapp', 'new', 'Consulta por crédito automotriz'),
('lead_007', 'veh_014', 'Diego Rodríguez', 'diego.rodriguez@email.com', '+56977777777', 'web', 'scheduled', 'Viene con su mecánico'),
('lead_008', 'veh_018', 'Sofia Torres', 'sofia.torres@email.com', '+56988888888', 'web', 'new', 'Interesada en vehículo eléctrico'),
('lead_009', 'veh_019', 'Roberto Díaz', 'roberto.diaz@email.com', '+56999999999', 'facebook', 'closed_won', 'Vendido - reserva confirmada'),
('lead_010', 'veh_020', 'Carmen Ruiz', 'carmen.ruiz@email.com', '+56900000000', 'referral', 'closed_lost', 'Compró en otra concesionaria');

-- ==================== CONSIGNACIONES ====================

INSERT INTO Consignment (id, ownerName, ownerPhone, brand, model, year, km, expectedPrice, status) VALUES
('cons_001', 'Roberto Muñoz', '+56912345123', 'Toyota', 'Camry', 2020, 55000, 16000000, 'approved'),
('cons_002', 'Patricia Vega', '+56923456234', 'Honda', 'Accord', 2019, 70000, 13000000, 'under_review'),
('cons_003', 'Fernando Silva', '+56934567345', 'Mazda', 'CX-5', 2021, 40000, 20000000, 'received');

-- ==================== SUBASTAS ====================

INSERT INTO Auction (id, vehicleId, startingPrice, minIncrement, depositAmount, startTime, endTime, status) VALUES
('auction_001', 'veh_008', 15000000, 200000, 500000, datetime('now', '-2 days'), datetime('now', '+5 days'), 'active'),
('auction_002', 'veh_011', 12000000, 100000, 300000, datetime('now', '-1 day'), datetime('now', '+3 days'), 'active');

-- ==================== CONFIGURACIONES ====================

INSERT INTO Setting (id, key, value, description) VALUES
('set_001', 'site_name', '"MTG Automotora"', 'Nombre del sitio'),
('set_002', 'contact_whatsapp', '"+56912345678"', 'WhatsApp de contacto'),
('set_003', 'reservation_amount', '"100000"', 'Monto mínimo de reserva'),
('set_004', 'auction_deposit', '"500000"', 'Depósito para participar en subastas');
