-- MTG Automotora - D1 Database Schema
-- Compatible with Cloudflare D1 (SQLite-based)
-- Version: 1.0

-- ==================== USUARIOS Y AUTENTICACIÓN ====================

CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'sales',
  phone TEXT,
  avatar TEXT,
  isActive INTEGER DEFAULT 1,
  lastLogin DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- ==================== VEHÍCULOS ====================

CREATE TABLE IF NOT EXISTS Vehicle (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price INTEGER NOT NULL,
  km INTEGER,
  vin TEXT,
  plate TEXT,
  region TEXT,
  city TEXT,
  description TEXT,
  transmission TEXT,
  fuelType TEXT,
  color TEXT,
  doors INTEGER,
  engine TEXT,
  horsepower INTEGER,
  status TEXT DEFAULT 'draft',
  
  isConsignment INTEGER DEFAULT 0,
  consignorId TEXT,
  consignorName TEXT,
  consignorPhone TEXT,
  commissionPct REAL,
  
  purchasePrice INTEGER,
  
  publishedAt DATETIME,
  soldAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  createdById TEXT,
  FOREIGN KEY (createdById) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS VehiclePhoto (
  id TEXT PRIMARY KEY,
  vehicleId TEXT NOT NULL,
  url TEXT NOT NULL,
  orderIndex INTEGER DEFAULT 0,
  isPrimary INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicleId) REFERENCES Vehicle(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vehicle_photos ON VehiclePhoto(vehicleId);

CREATE TABLE IF NOT EXISTS Document (
  id TEXT PRIMARY KEY,
  vehicleId TEXT,
  uploadedBy TEXT,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicleId) REFERENCES Vehicle(id) ON DELETE CASCADE,
  FOREIGN KEY (uploadedBy) REFERENCES User(id)
);

-- ==================== RESERVAS ====================

CREATE TABLE IF NOT EXISTS Reservation (
  id TEXT PRIMARY KEY,
  vehicleId TEXT NOT NULL,
  userId TEXT,
  
  customerName TEXT NOT NULL,
  customerEmail TEXT,
  customerPhone TEXT NOT NULL,
  customerRut TEXT,
  
  amount INTEGER NOT NULL,
  paymentMethod TEXT,
  paymentId TEXT,
  idempotencyKey TEXT UNIQUE,
  
  status TEXT DEFAULT 'pending_payment',
  expiresAt DATETIME NOT NULL,
  confirmedAt DATETIME,
  cancelledAt DATETIME,
  cancelledReason TEXT,
  
  notes TEXT,
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (vehicleId) REFERENCES Vehicle(id),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE INDEX IF NOT EXISTS idx_reservation_vehicle ON Reservation(vehicleId);
CREATE INDEX IF NOT EXISTS idx_reservation_status ON Reservation(status);
CREATE INDEX IF NOT EXISTS idx_reservation_expires ON Reservation(expiresAt);

-- ==================== SUBASTAS ====================

CREATE TABLE IF NOT EXISTS Auction (
  id TEXT PRIMARY KEY,
  vehicleId TEXT NOT NULL,
  
  startingPrice INTEGER NOT NULL,
  minIncrement INTEGER DEFAULT 100000,
  depositAmount INTEGER DEFAULT 50000,
  
  startTime DATETIME NOT NULL,
  endTime DATETIME NOT NULL,
  paymentExpiresAt DATETIME,
  
  status TEXT DEFAULT 'scheduled',
  
  winnerId TEXT,
  winnerBidId TEXT,
  finalPrice INTEGER,
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (vehicleId) REFERENCES Vehicle(id),
  FOREIGN KEY (winnerId) REFERENCES User(id)
);

CREATE INDEX IF NOT EXISTS idx_auction_vehicle ON Auction(vehicleId);
CREATE INDEX IF NOT EXISTS idx_auction_status ON Auction(status);
CREATE INDEX IF NOT EXISTS idx_auction_endtime ON Auction(endTime);

CREATE TABLE IF NOT EXISTS Bid (
  id TEXT PRIMARY KEY,
  auctionId TEXT NOT NULL,
  userId TEXT NOT NULL,
  amount INTEGER NOT NULL,
  isWinner INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (auctionId) REFERENCES Auction(id),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE INDEX IF NOT EXISTS idx_bid_auction ON Bid(auctionId);
CREATE INDEX IF NOT EXISTS idx_bid_amount ON Bid(amount);

-- ==================== CONSIGNACIONES ====================

CREATE TABLE IF NOT EXISTS Consignment (
  id TEXT PRIMARY KEY,
  vehicleId TEXT UNIQUE,
  
  ownerName TEXT NOT NULL,
  ownerEmail TEXT,
  ownerPhone TEXT NOT NULL,
  ownerRut TEXT,
  
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  km INTEGER,
  expectedPrice INTEGER,
  
  status TEXT DEFAULT 'received',
  reviewedBy TEXT,
  reviewedAt DATETIME,
  rejectionReason TEXT,
  
  commissionPct REAL,
  agreedPrice INTEGER,
  
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (vehicleId) REFERENCES Vehicle(id),
  FOREIGN KEY (reviewedBy) REFERENCES User(id)
);

CREATE INDEX IF NOT EXISTS idx_consignment_status ON Consignment(status);

-- ==================== LEADS ====================

CREATE TABLE IF NOT EXISTS Lead (
  id TEXT PRIMARY KEY,
  vehicleId TEXT,
  userId TEXT,
  
  customerName TEXT NOT NULL,
  customerEmail TEXT,
  customerPhone TEXT NOT NULL,
  
  source TEXT,
  status TEXT DEFAULT 'new',
  
  notes TEXT,
  lastContactAt DATETIME,
  nextFollowUpAt DATETIME,
  
  convertedTo TEXT,
  convertedAt DATETIME,
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (vehicleId) REFERENCES Vehicle(id),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE INDEX IF NOT EXISTS idx_lead_status ON Lead(status);
CREATE INDEX IF NOT EXISTS idx_lead_vehicle ON Lead(vehicleId);

-- ==================== PAGOS ====================

CREATE TABLE IF NOT EXISTS PaymentTransaction (
  id TEXT PRIMARY KEY,
  reservationId TEXT,
  auctionId TEXT,
  
  provider TEXT NOT NULL,
  providerTxId TEXT,
  
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'CLP',
  
  status TEXT DEFAULT 'pending',
  idempotencyKey TEXT UNIQUE NOT NULL,
  
  webhookPayload TEXT,
  
  confirmedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (reservationId) REFERENCES Reservation(id),
  FOREIGN KEY (auctionId) REFERENCES Auction(id)
);

CREATE INDEX IF NOT EXISTS idx_transaction_idempotency ON PaymentTransaction(idempotencyKey);
CREATE INDEX IF NOT EXISTS idx_transaction_provider ON PaymentTransaction(provider);

-- ==================== AUDITORÍA ====================

CREATE TABLE IF NOT EXISTS AuditLog (
  id TEXT PRIMARY KEY,
  tableName TEXT NOT NULL,
  recordId TEXT NOT NULL,
  action TEXT NOT NULL,
  oldValues TEXT,
  newValues TEXT,
  userId TEXT,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE INDEX IF NOT EXISTS idx_audit_table ON AuditLog(tableName);
CREATE INDEX IF NOT EXISTS idx_audit_record ON AuditLog(recordId);

-- ==================== CONFIGURACIÓN ====================

CREATE TABLE IF NOT EXISTS Setting (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==================== RIFAS (Fase 3) ====================

CREATE TABLE IF NOT EXISTS Raffle (
  id TEXT PRIMARY KEY,
  vehicleId TEXT NOT NULL,
  
  ticketPrice INTEGER NOT NULL,
  totalTickets INTEGER NOT NULL,
  ticketsSold INTEGER DEFAULT 0,
  
  startTime DATETIME NOT NULL,
  endTime DATETIME NOT NULL,
  
  status TEXT DEFAULT 'draft',
  winnerTicket INTEGER,
  winnerId TEXT,
  
  drawnAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_raffle_status ON Raffle(status);

CREATE TABLE IF NOT EXISTS RaffleTicket (
  id TEXT PRIMARY KEY,
  raffleId TEXT NOT NULL,
  ticketNumber INTEGER NOT NULL,
  
  buyerName TEXT NOT NULL,
  buyerEmail TEXT,
  buyerPhone TEXT NOT NULL,
  buyerRut TEXT,
  
  paymentId TEXT,
  status TEXT DEFAULT 'reserved',
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (raffleId) REFERENCES Raffle(id),
  
  UNIQUE(raffleId, ticketNumber)
);

CREATE INDEX IF NOT EXISTS idx_ticket_raffle ON RaffleTicket(raffleId);
