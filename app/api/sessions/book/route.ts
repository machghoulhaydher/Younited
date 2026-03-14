// app/api/sessions/book/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const BookSchema = z.object({
  partnerId:     z.string().uuid(),
  scheduledAt:   z.string().datetime(),
  contactMethod: z.enum(['WHATSAPP', 'ZOOM', 'PHONE']),
  durationMin:   z.number().default(30),
})

export async function POST(req: NextRequest) {
  try {
    const currentUser = getUserFromRequest(req)
    if (!currentUser) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    // Check subscription is active
    const sub = await prisma.subscription.findUnique({ where: { userId: currentUser.userId } })
    if (!sub || sub.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'يجب أن يكون لديك اشتراك فعّال لحجز جلسة' }, { status: 403 })
    }

    const data = BookSchema.parse(await req.json())

    // Check slot not taken
    const conflictStart = new Date(data.scheduledAt)
    const conflictEnd = new Date(conflictStart.getTime() + data.durationMin * 60000)
    const conflict = await prisma.session.findFirst({
      where: {
        partnerId: data.partnerId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        scheduledAt: { gte: conflictStart, lt: conflictEnd }
      }
    })
    if (conflict) return NextResponse.json({ error: 'هذا الموعد محجوز مسبقاً' }, { status: 409 })

    const session = await prisma.session.create({
      data: {
        candidateId:   currentUser.userId,
        partnerId:     data.partnerId,
        scheduledAt:   new Date(data.scheduledAt),
        contactMethod: data.contactMethod,
        durationMin:   data.durationMin,
        status:        'CONFIRMED',
      },
      include: { partner: { select: { firstName: true, lastName: true, phone: true } } }
    })

    // Update funnel stage
    await prisma.funnelProgress.update({
      where: { userId: currentUser.userId },
      data: {
        sessionBooked: true,
        sessionId: session.id,
        sessionBookedAt: new Date(),
        currentStage: 'SESSION',
      }
    })

    await prisma.activityLog.create({
      data: { userId: currentUser.userId, action: 'session_booked', details: { sessionId: session.id } as any }
    })

    return NextResponse.json({ session, message: 'تم حجز جلستك بنجاح!' }, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: 'بيانات غير صحيحة', details: err.errors }, { status: 400 })
    console.error('Book session error:', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}

// GET /api/sessions/book — list user's sessions
export async function GET(req: NextRequest) {
  const currentUser = getUserFromRequest(req)
  if (!currentUser) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const sessions = await prisma.session.findMany({
    where: { OR: [{ candidateId: currentUser.userId }, { partnerId: currentUser.userId }] },
    orderBy: { scheduledAt: 'asc' },
    include: {
      candidate: { select: { firstName: true, lastName: true, phone: true } },
      partner:   { select: { firstName: true, lastName: true, phone: true, partnerSlug: true } },
    }
  })
  return NextResponse.json({ sessions })
}
