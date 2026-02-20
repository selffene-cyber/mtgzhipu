// Database configuration for Cloudflare D1
// This file handles the Prisma client with D1 adapter for production

import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

// Type declaration for Cloudflare env bindings
declare global {
  interface CloudflareEnv {
    DB: D1Database
    BUCKET: R2Bucket
  }
}

// Get Prisma client with D1 adapter
export function getPrismaClient(d1Database: D1Database): PrismaClient {
  const adapter = new PrismaD1(d1Database)
  return new PrismaClient({ adapter })
}

// For use in Cloudflare Pages functions
export function getDB(): D1Database | null {
  // This will be populated by the Cloudflare runtime
  if (typeof globalThis !== 'undefined' && (globalThis as any).DB) {
    return (globalThis as any).DB
  }
  return null
}
