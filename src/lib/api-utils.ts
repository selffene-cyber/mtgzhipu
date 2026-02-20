// MTG Automotora - API Utilities
// Helper functions for API routes

import { NextRequest, NextResponse } from 'next/server'
import { getDB } from './db'
import { PrismaClient } from '@prisma/client'

// Wrapper for API route handlers that provides DB client
export function withDB(
  handler: (req: NextRequest, context: { params: Promise<Record<string, string>> }, db: PrismaClient) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    try {
      const db = await getDB()
      return handler(req, context, db)
    } catch (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Internal server error', message: 'Error de conexión a la base de datos' },
        { status: 500 }
      )
    }
  }
}

// CORS headers for API responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle CORS preflight requests
export function handleCors(): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

// Add CORS headers to response
export function withCors(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

// Error response helper
export function errorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

// Success response helper
export function successResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(data, { status })
}
