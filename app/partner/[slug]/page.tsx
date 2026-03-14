'use client'
// app/partner/[slug]/page.tsx — صفحة الشريك الشخصية

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// In production: fetch partner data by slug from API
const DEMO_PARTNER = {
  name: 'أحمد بن سالم',
  role: 'قائد فريق — شريك ذهبي في R.B.U',
  region: 'تونس العاصمة',
  since: '2023',
  initials: 'أح',
  slug: 'ahmed-bensalem',
  bio: 'قائد فريق متمرس في R.B.U منذ 2023. ساعدت أكثر من 47 شريكاً على تحقيق دخل إضافي حقيقي.',
  stats: { partners: 47, years: 3.2, successRate: 92, sessions: 18 },
  story: [
    { period: '2022 — نقطة الانطلاق', title: 'موظف بدوام كامل — راتب ثابت، حلم معلّق', desc: 'كنت أعمل 9 ساعات يومياً وأشعر أن وقتي يُسرق مني.', result: null, color: '#D4A017' },
    { period: 'مارس 2023 — الاكتشاف', title: 'أول تعرّف على نظام R.B.U', desc: 'شاهدت عرض العمل وكنت متشككاً. بعد التسجيل فهمت أن هذا النظام حقيقي وقابل للتطبيق.', result: 'أول طلبية في الأسبوع الأول', color: '#1A5FBE' },
    { period: 'يونيو 2023 — أول دخل', title: 'دخل إضافي تجاوز راتبي الأساسي', desc: 'في الشهر الثالث بدأت أرى أرقاماً حقيقية. بنيت فريقاً صغيراً وبدأ الدخل يتراكم.', result: '+3800 د دخل شهري إضافي', color: '#1D9E75' },
    { period: '2024 — الحاضر', title: 'قائد فريق بـ 47 شريكاً نشطاً', desc: 'تركت وظيفتي واخترت هذا النظام كمصدر دخل رئيسي. أساعد شركائي يومياً.', result: 'دخل متكرر + فريق ينمو', color: '#993C1D' },
  ],
  testimonials: [
    { name: 'سمر التليلي', city: 'تونس', initials: 'سم', color: '#E6F1FB', textColor: '#1A5FBE', text: 'أحمد لم يكن فقط مرشداً، كان شريكاً حقيقياً في رحلتي. في الشهر الأول حققت أول دخل.' },
    { name: 'محمد الغزواني', city: 'صفاقس', initials: 'مح', color: '#E1F5EE', textColor: '#0F6E56', text: 'كنت خائفاً من التجربة لكن أسلوب أحمد جعل كل شيء واضحاً. النتائج حقيقية.' },
    { name: 'رنا بن عمر', city: 'سوسة', initials: 'رن', color: '#FAEEDA', textColor: '#854F0B', text: 'بنيت فريقاً من 12 شريكاً بفضل تدريب أحمد. الجلسات الاستراتيجية غيّرت تفكيري.' },
  ],
  trainings: [
    { title: 'الأسبوع الأول — الانطلاق الصحيح', meta: '3 فيديوهات • 22 دقيقة', locked: false },
    { title: 'بناء قائمة المرشحين — استراتيجية الـ 100', meta: '2 فيديو • 15 دقيقة', locked: false },
    { title: 'استخدام قمع الاستقطاب الرقمي', meta: '4 فيديوهات • 30 دقيقة', locked: false },
    { title: 'بناء فريق القادة — المستوى المتقدم', meta: '5 فيديوهات • 45 دقيقة', locked: true },
  ]
}

export default function PartnerPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [tab, setTab]       = useState(0)
  const [copied, setCopied] = useState(false)
  const p = DEMO_PARTNER

  function copyLink() {
    if (typeof window !== 'undefined') navigator.clipboard?.writeText(`${window.location.origin}/partner/${p.slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">

      {/* Hero */}
      <div className="bg-[#1A5FBE] px-5 py-6 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#D4A017]/15" />
        <div className="absolute -left-5 -bottom-10 w-24 h-24 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-18 h-18 w-[72px] h-[72px] rounded-full bg-[#D4A017] flex items-center justify-center font-black text-2xl text-[#412402] border-4 border-white/30">
              {p.initials}
            </div>
            <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-[#1D9E75] border-2 border-[#1A5FBE] flex items-center justify-center text-white text-xs font-bold">✓</div>
          </div>
          <div className="flex-1">
            <h1 className="text-white font-black text-lg">{p.name}</h1>
            <p className="text-blue-200 text-xs mb-2">{p.role}</p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/15 text-white/80">منطقة {p.region}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/15 text-white/80">عضو منذ {p.since}</span>
            </div>
          </div>
        </div>
        {/* Link copy */}
        <div className="relative mt-4 bg-black/25 rounded-xl px-3 py-2 flex items-center gap-3">
          <p className="text-white/50 text-xs flex-1 truncate">rbu.network/partner/{p.slug}</p>
          <button onClick={copyLink} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#D4A017] text-[#412402] flex-shrink-0">
            {copied ? '✓ تم' : 'نسخ'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 px-5 py-4 bg-white border-b border-gray-100">
        {[
          { val: p.stats.partners, label: 'شريك', color: '#1A5FBE' },
          { val: p.stats.years,    label: 'سنوات', color: '#D4A017' },
          { val: `${p.stats.successRate}%`, label: 'نجاح', color: '#1D9E75' },
          { val: p.stats.sessions, label: 'جلسة/شهر', color: '#993C1D' },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <p className="text-xl font-black" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {['قصتي', 'آراء الشركاء', 'التدريب'].map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`flex-1 py-3 text-xs font-bold transition-colors
              ${tab === i ? 'text-[#1A5FBE] border-b-2 border-[#1A5FBE]' : 'text-gray-400'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-5 py-5 space-y-4">

        {/* Tab 0: Story */}
        {tab === 0 && (
          <>
            {/* Story video placeholder */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="bg-[#0a1628] aspect-video flex flex-col items-center justify-center cursor-pointer">
                <div className="w-14 h-14 rounded-full border-2 border-[#D4A017]/60 flex items-center justify-center mb-3">
                  <div className="w-0 h-0 border-t-[11px] border-t-transparent border-b-[11px] border-b-transparent border-l-[20px] border-l-[#D4A017] ml-1" />
                </div>
                <p className="text-white/60 text-sm">قصة أحمد — من موظف إلى قائد فريق</p>
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-sm">قصتي الشخصية مع R.B.U</p>
                  <p className="text-gray-400 text-xs">12 دقيقة • مشاهدة موصى بها</p>
                </div>
                <span className="badge-green text-xs">جديد</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-0">
              {p.story.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ background: s.color }} />
                    {i < p.story.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                  </div>
                  <div className="pb-5 flex-1">
                    <p className="text-xs text-gray-400 mb-1">{s.period}</p>
                    <p className="font-bold text-gray-900 text-sm mb-1">{s.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed mb-2">{s.desc}</p>
                    {s.result && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: `${s.color}20`, color: s.color }}>{s.result}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Tab 1: Testimonials */}
        {tab === 1 && (
          <div className="space-y-3">
            {p.testimonials.map((t, i) => (
              <div key={i} className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: t.color, color: t.textColor }}>{t.initials}</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.city}</p>
                  </div>
                  <span className="text-[#D4A017] text-xs">★★★★★</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed border-r-2 border-[#D4A017] pr-3">{t.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Training */}
        {tab === 2 && (
          <div className="space-y-3">
            {p.trainings.map((t, i) => (
              <div key={i} className={`card flex items-center gap-3 transition-all
                ${t.locked ? 'opacity-50' : 'hover:border-[#D4A017] cursor-pointer'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                  ${t.locked ? 'bg-gray-100 text-gray-400' : 'bg-[#FAEEDA] text-[#854F0B]'}`}>
                  {t.locked ? '🔒' : i + 1}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${t.locked ? 'text-gray-400' : 'text-gray-900'}`}>{t.title}</p>
                  <p className="text-xs text-gray-400">{t.meta}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${t.locked ? 'badge-gray' : 'badge-green'}`}>
                  {t.locked ? 'قريباً' : 'متاح'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="card-blue text-center">
          <h3 className="font-black text-lg mb-1">ابدأ رحلتك مع أحمد اليوم</h3>
          <p className="text-blue-200 text-sm mb-4">احجز جلستك الاستراتيجية الأولى مجاناً</p>
          <button onClick={() => router.push('/booking')} className="btn-gold w-full py-3 mb-2">احجز جلستك ←</button>
          <button onClick={copyLink} className="btn-outline w-full py-2 bg-transparent border-white/20 text-white/70 hover:bg-white/10">
            مشاركة الصفحة الشخصية
          </button>
        </div>
      </div>
    </div>
  )
}
