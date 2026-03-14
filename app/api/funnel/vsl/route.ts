// app/api/funnel/vsl/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// POST /api/funnel/vsl — mark VSL as watched + save answers
export async function POST(req: NextRequest) {
  try {
    const currentUser = getUserFromRequest(req)
    if (!currentUser) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const { watchPct, answer1, clarityScore } = await req.json()

    const isComplete = watchPct >= 95

    await prisma.funnelProgress.update({
      where: { userId: currentUser.userId },
      data: {
        vslWatchPct: watchPct,
        vslWatched: isComplete,
        vslAnswer1: answer1,
        vslClarityScore: clarityScore,
        vslCompletedAt: isComplete ? new Date() : undefined,
        currentStage: isComplete ? 'VSL' : undefined,
      }
    })

    await prisma.activityLog.create({
      data: {
        userId: currentUser.userId,
        action: isComplete ? 'vsl_completed' : 'vsl_progress',
        details: { watchPct, clarityScore } as any
      }
    })

    return NextResponse.json({
      watched: isComplete,
      nextStep: isComplete ? '/register' : null,
      message: isComplete ? 'شاهدت العرض كاملاً! انتقل لخطوات التسجيل.' : 'واصل المشاهدة...'
    })
  } catch (err) {
    console.error('VSL error:', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}

// app/api/funnel/progress/route.ts — GET funnel state
export { GET } from './progress'
