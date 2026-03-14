// app/api/funnel/progress/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const currentUser = getUserFromRequest(req)
  if (!currentUser) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const [progress, subscription] = await Promise.all([
    prisma.funnelProgress.findUnique({ where: { userId: currentUser.userId } }),
    prisma.subscription.findUnique({ where: { userId: currentUser.userId } }),
  ])

  return NextResponse.json({
    stage: progress?.currentStage || 'LANDING',
    progress,
    subscription: subscription ? {
      plan: subscription.plan,
      status: subscription.status,
      endDate: subscription.endDate,
      daysLeft: Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / 86400000)),
    } : null,
  })
}
