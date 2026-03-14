// app/api/admin/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const currentUser = getUserFromRequest(req)
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح — مدير فقط' }, { status: 403 })
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfWeek  = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay())

  const [
    totalCandidates, newThisMonth,
    activePartners,  newPartnersMonth,
    sessionsThisWeek,
    activeSubscriptions,
    revenueThisMonth,
    funnelStats,
    expiringSubscriptions,
    recentCandidates,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CANDIDATE' } }),
    prisma.user.count({ where: { role: 'CANDIDATE', createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { role: 'PARTNER', subscription: { status: 'ACTIVE' } } }),
    prisma.user.count({ where: { role: 'PARTNER', createdAt: { gte: startOfMonth } } }),
    prisma.session.count({ where: { scheduledAt: { gte: startOfWeek }, status: { in: ['PENDING','CONFIRMED'] } } }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.payment.aggregate({ where: { paidAt: { gte: startOfMonth }, status: 'succeeded' }, _sum: { amount: true } }),

    // Funnel conversion stats
    prisma.funnelProgress.groupBy({
      by: ['currentStage'],
      _count: { currentStage: true },
    }),

    // Subscriptions expiring in 3 days
    prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { lte: new Date(Date.now() + 3 * 86400000) }
      },
      include: { user: { select: { firstName: true, lastName: true, phone: true } } },
      orderBy: { endDate: 'asc' },
    }),

    // Recent candidates
    prisma.user.findMany({
      where: { role: 'CANDIDATE' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { funnelProgress: true },
    }),
  ])

  return NextResponse.json({
    kpi: {
      totalCandidates, newThisMonth,
      activePartners,  newPartnersMonth,
      sessionsThisWeek,
      activeSubscriptions,
      revenueThisMonth: Number(revenueThisMonth._sum.amount || 0),
    },
    funnelStats: funnelStats.reduce((acc, s) => ({
      ...acc,
      [s.currentStage]: s._count.currentStage
    }), {} as Record<string, number>),
    alerts: {
      expiringSubscriptions: expiringSubscriptions.map(s => ({
        userId: s.userId,
        name: `${s.user.firstName} ${s.user.lastName}`,
        phone: s.user.phone,
        endDate: s.endDate,
        plan: s.plan,
      })),
    },
    recentCandidates: recentCandidates.map(c => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      phone: c.phone,
      stage: c.funnelProgress?.currentStage || 'LANDING',
      score: c.funnelProgress?.surveyScore || 0,
      createdAt: c.createdAt,
    })),
  })
}
