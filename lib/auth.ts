// lib/auth.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

export interface JWTPayload {
  userId: string
  role: string
  email?: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7)
  const cookie = req.cookies.get('rbu_token')
  return cookie?.value || null
}

export function getUserFromRequest(req: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(req)
  if (!token) return null
  return verifyToken(token)
}

export function generateReferralCode(name: string): string {
  const base = name.toLowerCase().replace(/\s/g, '').slice(0, 6)
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${base}-${suffix}`
}
