// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, signToken } from '@/lib/auth'
import { z } from 'zod'

const LoginSchema = z.object({
  phone:    z.string().min(8),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = LoginSchema.parse(await req.json())

    const user = await prisma.user.findUnique({
      where: { phone },
      include: { funnelProgress: true, subscription: true }
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'رقم الهاتف أو كلمة المرور غير صحيحة' }, { status: 401 })
    }

    const valid = await comparePassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'رقم الهاتف أو كلمة المرور غير صحيحة' }, { status: 401 })
    }

    const token = signToken({ userId: user.id, role: user.role, email: user.email || undefined })

    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode,
      partnerSlug: user.partnerSlug,
      funnelStage: user.funnelProgress?.currentStage,
      subscriptionStatus: user.subscription?.status,
      subscriptionEnd: user.subscription?.endDate,
    }

    await prisma.activityLog.create({ data: { userId: user.id, action: 'login' } })

    const response = NextResponse.json({ user: safeUser, token })
    response.cookies.set('rbu_token', token, { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 7, path: '/' })
    return response

  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 })
    console.error('Login error:', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
