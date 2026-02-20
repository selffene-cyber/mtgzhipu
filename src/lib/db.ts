// MTG Automotora - Database Configuration
// Handles both local SQLite (development) and Cloudflare D1 (production)

import { PrismaClient } from '@prisma/client'

// Detect if we're in Cloudflare environment
const isCloudflare = typeof globalThis !== 'undefined' && 
  'caches' in globalThis && 
  !!(globalThis as any).WEBWORKER

// Global Prisma instance for development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client based on environment
function createPrismaClient(): PrismaClient {
  if (isCloudflare) {
    // In Cloudflare, we need to use the D1 adapter
    // This is handled separately in API routes via getPrismaClientFromContext
    throw new Error('In Cloudflare environment, use getPrismaClientFromContext() instead')
  }
  
  // Local development - use SQLite
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Export for local development
export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Type for Cloudflare request context
interface CloudflareContext {
  env: {
    DB: D1Database
    BUCKET: R2Bucket
  }
}

// Helper to get Prisma from Cloudflare context (used in API routes)
export async function getPrismaFromContext(): Promise<PrismaClient | null> {
  try {
    // Dynamic import for Cloudflare
    const { getRequestContext } = await import('@cloudflare/next-on-pages')
    const context = getRequestContext() as CloudflareContext | undefined
    
    if (context?.env?.DB) {
      const { PrismaD1 } = await import('@prisma/adapter-d1')
      const adapter = new PrismaD1(context.env.DB)
      return new PrismaClient({ adapter })
    }
  } catch {
    // Not in Cloudflare environment
  }
  return null
}

// Unified function to get the database client
export async function getDB(): Promise<PrismaClient> {
  const cloudflarePrisma = await getPrismaFromContext()
  if (cloudflarePrisma) {
    return cloudflarePrisma
  }
  return db
}

// Export types
export type { PrismaClient }
