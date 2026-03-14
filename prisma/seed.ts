// prisma/seed.ts
// Run: npm run db:seed

import { PrismaClient, UserRole, SubscriptionPlan, SubscriptionStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

function generateReferralCode(name: string): string {
  const base = name.toLowerCase().replace(/\s/g, '').slice(0, 6)
  const suffix = randomBytes(3).toString('hex').toUpperCase()
  return `${base}-${suffix}`
}

async function main() {
  console.log('🌱 Seeding database...')

  // ── Admin ──────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@2026', 10)
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@rbu.network' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'RBU',
      email: process.env.ADMIN_EMAIL || 'admin@rbu.network',
      phone: '+21600000000',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      referralCode: generateReferralCode('admin'),
      partnerSlug: 'admin',
    }
  })
  console.log('✅ Admin created:', admin.email)

  // ── Partner Demo ───────────────────────────────────────────
  const partnerPassword = await bcrypt.hash('Partner@2026', 10)
  const partner = await prisma.user.upsert({
    where: { email: 'ahmed@rbu.network' },
    update: {},
    create: {
      firstName: 'أحمد',
      lastName: 'بن سالم',
      email: 'ahmed@rbu.network',
      phone: '+21622000001',
      passwordHash: partnerPassword,
      role: UserRole.PARTNER,
      referralCode: generateReferralCode('ahmed'),
      partnerSlug: 'ahmed-bensalem',
      partnerBio: 'قائد فريق متمرس في R.B.U منذ 2023. ساعدت أكثر من 47 شريكاً على تحقيق دخل إضافي حقيقي.',
      partnerRegion: 'تونس العاصمة',
      joinedAt: new Date('2023-03-15'),
      funnelProgress: {
        create: {
          currentStage: 'PARTNER',
          surveyCompleted: true,
          surveyScore: 85,
          vslWatched: true,
          vslWatchPct: 100,
          rbuRegistered: true,
          firstOrderDone: true,
          sessionBooked: true,
        }
      },
      subscription: {
        create: {
          plan: SubscriptionPlan.YEARLY,
          status: SubscriptionStatus.ACTIVE,
          amount: 790,
          currency: 'TND',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
          autoRenew: true,
        }
      }
    }
  })
  console.log('✅ Partner demo created:', partner.email)

  // ── Testimonials ───────────────────────────────────────────
  await prisma.testimonial.createMany({
    skipDuplicates: true,
    data: [
      {
        partnerId: partner.id,
        authorName: 'سمر التليلي',
        authorCity: 'تونس العاصمة',
        content: 'أحمد لم يكن فقط مرشداً، كان شريكاً حقيقياً في رحلتي. في أول شهر حققت أول دخل وبعد 4 أشهر تجاوزت هدفي الشهري.',
        rating: 5,
      },
      {
        partnerId: partner.id,
        authorName: 'محمد الغزواني',
        authorCity: 'صفاقس',
        content: 'كنت خائفاً من التجربة لكن أسلوب أحمد في الشرح جعل كل شيء واضحاً. النظام أبسط مما كنت أتخيل والنتائج حقيقية.',
        rating: 5,
      },
      {
        partnerId: partner.id,
        authorName: 'رنا بن عمر',
        authorCity: 'سوسة',
        content: 'بنيت فريقاً من 12 شريكاً بفضل تدريب أحمد. الجلسات الاستراتيجية معه غيّرت طريقة تفكيري في العمل بالكامل.',
        rating: 5,
      },
    ]
  })
  console.log('✅ Testimonials seeded')

  // ── Demo Candidates ────────────────────────────────────────
  const candidates = [
    { firstName: 'ياسمين', lastName: 'الحاج', phone: '+21622001001', stage: 'SESSION' as const, score: 92 },
    { firstName: 'نادر', lastName: 'الزيتوني', phone: '+21622001002', stage: 'REGISTRATION' as const, score: 78 },
    { firstName: 'إيمان', lastName: 'بوعزيزي', phone: '+21622001003', stage: 'VSL' as const, score: 65 },
    { firstName: 'وليد', lastName: 'المختار', phone: '+21622001004', stage: 'VSL' as const, score: 70 },
    { firstName: 'سلوى', lastName: 'الرحموني', phone: '+21622001005', stage: 'SURVEY' as const, score: 55 },
  ]

  for (const c of candidates) {
    const pw = await bcrypt.hash('Demo@2026', 10)
    await prisma.user.upsert({
      where: { phone: c.phone },
      update: {},
      create: {
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        passwordHash: pw,
        role: UserRole.CANDIDATE,
        referralCode: generateReferralCode(c.firstName),
        referredById: partner.id,
        funnelProgress: {
          create: {
            currentStage: c.stage,
            surveyCompleted: ['VSL','REGISTRATION','SESSION','PARTNER'].includes(c.stage),
            surveyScore: c.score,
            vslWatched: ['REGISTRATION','SESSION','PARTNER'].includes(c.stage),
            vslWatchPct: ['REGISTRATION','SESSION','PARTNER'].includes(c.stage) ? 100 : 0,
            rbuRegistered: ['SESSION','PARTNER'].includes(c.stage),
          }
        }
      }
    })
  }
  console.log('✅ Demo candidates seeded')
  console.log('\n🎉 Seed complete!')
  console.log('─────────────────────────────')
  console.log('Admin:', process.env.ADMIN_EMAIL || 'admin@rbu.network')
  console.log('Admin Password: Admin@2026')
  console.log('Partner: ahmed@rbu.network / Partner@2026')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
