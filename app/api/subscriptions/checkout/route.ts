// app/api/subscriptions/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const CheckoutSchema = z.object({
  plan: z.enum(['MONTHLY', 'YEARLY']),
})

export async function POST(req: NextRequest) {
  try {
    const currentUser = getUserFromRequest(req)
    if (!currentUser) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const { plan } = CheckoutSchema.parse(await req.json())

    const user = await prisma.user.findUnique({ where: { id: currentUser.userId } })
    if (!user) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })

    const isMonthly = plan === 'MONTHLY'
    const amount = isMonthly
      ? Number(process.env.MONTHLY_PRICE || 89)
      : Number(process.env.YEARLY_PRICE || 790)

    // If Stripe is configured, create a real checkout session
    if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_')) {
      const Stripe = require('stripe')
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

      const priceId = isMonthly
        ? process.env.STRIPE_MONTHLY_PRICE_ID
        : process.env.STRIPE_YEARLY_PRICE_ID

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: user.email || undefined,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
        cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/subscribe?payment=cancelled`,
        metadata: { userId: user.id, plan },
      })

      return NextResponse.json({ checkoutUrl: session.url })
    }

    // Demo mode: create subscription directly (no real payment)
    const startDate = new Date()
    const endDate = new Date()
    if (isMonthly) endDate.setMonth(endDate.getMonth() + 1)
    else           endDate.setFullYear(endDate.getFullYear() + 1)

    const sub = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: { plan, status: 'ACTIVE', amount, startDate, endDate, reminderSent: false },
      create: { userId: user.id, plan, status: 'ACTIVE', amount, currency: process.env.CURRENCY || 'TND', startDate, endDate },
    })

    await prisma.payment.create({
      data: {
        subscriptionId: sub.id,
        amount,
        currency: process.env.CURRENCY || 'TND',
        status: 'succeeded',
        gateway: 'demo',
        paidAt: new Date(),
      }
    })

    await prisma.activityLog.create({
      data: { userId: user.id, action: 'subscription_activated', details: { plan, amount } as any }
    })

    return NextResponse.json({ success: true, subscription: sub, redirectUrl: '/dashboard' })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 })
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
