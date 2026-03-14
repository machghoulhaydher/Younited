// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateReferralCode, signToken } from '@/lib/auth'
import { z } from 'zod'

const RegisterSchema = z.object({
  firstName: z.string().min(2),
  lastName:  z.string().min(2),
  phone:     z.string().min(8),
  email:     z.string().email().optional(),
  address:   z.string().optional(),
  password:  z.string().min(6),
  referralCode: z.string().optional(), // invited by a partner
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = RegisterSchema.parse(body)

    // Check uniqueness
    const existing = await prisma.user.findFirst({
      where: { OR: [{ phone: data.phone }, ...(data.email ? [{ email: data.email }] : [])] }
    })
    if (existing) {
      return NextResponse.json({ error: 'رقم الهاتف أو البريد الإلكتروني مسجّل مسبقاً' }, { status: 409 })
    }

    // Find referrer if code provided
    let referredById: string | undefined
    if (data.referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: data.referralCode } })
      if (referrer) referredById = referrer.id
    }

    const passwordHash = await hashPassword(data.password)
    const referralCode = generateReferralCode(`${data.firstName}${data.lastName}`)

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName:  data.lastName,
        phone:     data.phone,
        email:     data.email,
        address:   data.address,
        passwordHash,
        referralCode,
        referredById,
        funnelProgress: { create: { currentStage: 'LANDING' } }
      },
      select: { id: true, firstName: true, lastName: true, phone: true, email: true, role: true, referralCode: true }
    })

    const token = signToken({ userId: user.id, role: user.role })

    // Log activity
    await prisma.activityLog.create({
      data: { userId: user.id, action: 'registered', details: { referredBy: referredById } }
    })

    const response = NextResponse.json({ user, token }, { status: 201 })
    response.cookies.set('rbu_token', token, { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 7, path: '/' })
    return response

  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: 'بيانات غير صحيحة', details: err.errors }, { status: 400 })
    console.error('Register error:', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
