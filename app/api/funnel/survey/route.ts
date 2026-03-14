// app/api/funnel/survey/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { scoreSurvey, SurveyAnswers } from '@/lib/survey-scoring'

export async function POST(req: NextRequest) {
  try {
    const currentUser = getUserFromRequest(req)
    if (!currentUser) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const body = await req.json()
    const answers = body.answers as SurveyAnswers

    if (!answers) return NextResponse.json({ error: 'الإجابات مطلوبة' }, { status: 400 })

    // Score the survey
    const { totalScore, decision, breakdown } = scoreSurvey(answers)

    // Update funnel progress
    await prisma.funnelProgress.upsert({
      where: { userId: currentUser.userId },
      update: {
        surveyCompleted: true,
        surveyScore: totalScore,
        surveyAnswers: answers as any,
        surveyPassedAt: new Date(),
        currentStage: decision === 'FAIL' ? 'LANDING' : 'SURVEY',
      },
      create: {
        userId: currentUser.userId,
        surveyCompleted: true,
        surveyScore: totalScore,
        surveyAnswers: answers as any,
        surveyPassedAt: new Date(),
        currentStage: decision === 'FAIL' ? 'LANDING' : 'SURVEY',
      }
    })

    await prisma.activityLog.create({
      data: {
        userId: currentUser.userId,
        action: 'survey_completed',
        details: { score: totalScore, decision, breakdown } as any
      }
    })

    return NextResponse.json({
      score: totalScore,
      decision,
      breakdown,
      message: decision === 'PASS'
        ? 'مبروك! أنت مرشح مناسب. انتقل لمشاهدة عرض العمل.'
        : decision === 'REVIEW'
        ? 'شكراً. سيراجع فريقنا إجاباتك ويتواصل معك قريباً.'
        : 'شكراً على وقتك. هذه الفرصة لا تتناسب مع وضعك الحالي.',
      nextStep: decision === 'PASS' ? '/vsl' : null,
    })
  } catch (err) {
    console.error('Survey error:', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const currentUser = getUserFromRequest(req)
  if (!currentUser) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const progress = await prisma.funnelProgress.findUnique({ where: { userId: currentUser.userId } })
  return NextResponse.json({ progress })
}
