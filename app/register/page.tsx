'use client'
// app/register/page.tsx — Phase 3: التوجيه والتسجيل

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = [
  { id: 'account',  label: 'فتح الحساب', icon: '📱' },
  { id: 'rbu',      label: 'التسجيل',    icon: '📋' },
  { id: 'order',    label: 'الطلب الأول', icon: '📦' },
  { id: 'training', label: 'التدريب',    icon: '🎓' },
]

const TRAININGS = [
  { id: 'tr1', title: 'كيف تتحدث عن المشروع بثقة',      duration: '8 دق', level: 'أساسي' },
  { id: 'tr2', title: 'بناء قائمة المرشحين الأولى',       duration: '6 دق', level: 'أساسي' },
  { id: 'tr3', title: 'استخدام روابط القمع الخاصة بك',    duration: '5 دق', level: 'متقدم' },
  { id: 'tr4', title: 'متابعة المرشحين وإغلاق الجلسة',   duration: '10 دق', level: 'متقدم' },
]

const LINKS = [
  { id: 'signup',   label: 'تسجيل جديد',      icon: '🌐', sub: 'إنشاء حساب في RBU', href: '#rbu-signup' },
  { id: 'form',     label: 'استمارة العضوية',  icon: '📋', sub: 'ملء بيانات الانضمام', href: '#rbu-form' },
  { id: 'activate', label: 'تفعيل الحساب',    icon: '💳', sub: 'دفع رسوم التفعيل',   href: '#rbu-activate' },
  { id: 'support',  label: 'دعم التسجيل',     icon: '📞', sub: 'مساعدة مباشرة',       href: '#rbu-support' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [activeStep, setActiveStep]         = useState(0)
  const [videosDone, setVideosDone]         = useState<Set<string>>(new Set())
  const [clickedLinks, setClickedLinks]     = useState<Set<string>>(new Set())
  const [donedTrainings, setDoneTrainings]  = useState<Set<string>>(new Set())
  const [submitting, setSubmitting]         = useState(false)

  const videoStep0Done = videosDone.has('v0')
  const videoStep2Done = videosDone.has('v2')
  const linksDone      = clickedLinks.size >= 2
  const trainsDone     = donedTrainings.size >= 2

  function clickLink(id: string) {
    setClickedLinks(prev => new Set([...prev, id]))
  }

  function toggleTrain(id: string) {
    setDoneTrainings(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function simulateVideo(id: string) {
    setTimeout(() => setVideosDone(prev => new Set([...prev, id])), 800)
  }

  async function finish() {
    setSubmitting(true)
    try {
      await fetch('/api/funnel/vsl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchPct: 100, answer1: 'completed', clarityScore: 8 }),
        credentials: 'include',
      })
      router.push('/booking')
    } catch { setSubmitting(false) }
  }

  const allDone = videoStep0Done && linksDone && videoStep2Done && trainsDone

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">

      {/* Header */}
      <header className="bg-[#1D9E75] px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-white font-black text-base">التوجيه والعمليات</p>
          <p className="text-green-100 text-xs">المرحلة 3 من 4</p>
        </div>
        <div className="badge-green text-xs bg-white/20 text-white">
          {Math.round(((activeStep) / STEPS.length) * 100)}% مكتمل
        </div>
      </header>

      {/* Step tabs */}
      <div className="flex border-b border-gray-200 bg-white overflow-x-auto">
        {STEPS.map((s, i) => (
          <button key={s.id} onClick={() => setActiveStep(i)}
            className={`flex-1 min-w-[80px] py-3 text-center text-xs font-bold transition-colors whitespace-nowrap
              ${activeStep === i ? 'text-[#1D9E75] border-b-2 border-[#1D9E75]' : 'text-gray-400'}`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-4">

        {/* ── Step 0: فتح الحساب ── */}
        {activeStep === 0 && (
          <>
            <div className="alert-gold">هذا الفيديو يشرح لك خطوة بخطوة كيف تفتح حسابك في أقل من 10 دقائق</div>
            <VideoCard id="v0" title="شرح فتح الحساب على R.B.U" duration="7 دقائق"
              done={videoStep0Done} onSimulate={() => simulateVideo('v0')} />
            <div className="flex gap-3">
              <button className="btn-outline flex-1" onClick={() => setActiveStep(Math.max(0, activeStep-1))}>→ رجوع</button>
              <button disabled={!videoStep0Done} onClick={() => setActiveStep(1)}
                className="btn-gold flex-1 disabled:opacity-40">التالي ←</button>
            </div>
          </>
        )}

        {/* ── Step 1: التسجيل ── */}
        {activeStep === 1 && (
          <>
            <div className="alert-gold">انقر على الروابط للتسجيل مباشرة في المنصة</div>
            <div className="grid grid-cols-2 gap-3">
              {LINKS.map(l => (
                <a key={l.id} href={l.href}
                  onClick={() => clickLink(l.id)}
                  className={`card text-center cursor-pointer transition-all block
                    ${clickedLinks.has(l.id) ? 'border-[#1D9E75] border-2 bg-[#E1F5EE]' : 'hover:border-[#1A5FBE]'}`}>
                  <div className="text-2xl mb-2">{l.icon}</div>
                  <p className="font-bold text-gray-900 text-xs">{l.label}</p>
                  <p className="text-gray-400 text-xs mt-1">{l.sub}</p>
                </a>
              ))}
            </div>
            <p className="text-xs text-center text-gray-400">
              {clickedLinks.size < 2 ? `افتح ${2 - clickedLinks.size} روابط على الأقل للمتابعة` : '✓ تم فتح الروابط المطلوبة'}
            </p>
            <div className="flex gap-3">
              <button className="btn-outline flex-1" onClick={() => setActiveStep(0)}>→ رجوع</button>
              <button disabled={!linksDone} onClick={() => setActiveStep(2)}
                className="btn-gold flex-1 disabled:opacity-40">التالي ←</button>
            </div>
          </>
        )}

        {/* ── Step 2: الطلب الأول ── */}
        {activeStep === 2 && (
          <>
            <div className="alert-gold">هذا الفيديو يشرح كيف تفعّل عضويتك بأول طلبية</div>
            <VideoCard id="v2" title="شرح الطلبية الأولى وتفعيل العضوية" duration="5 دقائق"
              done={videoStep2Done} onSimulate={() => simulateVideo('v2')} />
            <a href="#products"
              onClick={() => clickLink('products')}
              className={`card flex items-center gap-4 cursor-pointer transition-all
                ${clickedLinks.has('products') ? 'border-[#1D9E75] border-2 bg-[#E1F5EE]' : 'hover:border-[#D4A017]'}`}>
              <span className="text-3xl">🛒</span>
              <div>
                <p className="font-bold text-gray-900 text-sm">صفحة المنتجات — اختر طلبيتك الأولى</p>
                <p className="text-gray-400 text-xs mt-1">انقر للانتقال لكتالوج المنتجات في RBU</p>
              </div>
            </a>
            <div className="flex gap-3">
              <button className="btn-outline flex-1" onClick={() => setActiveStep(1)}>→ رجوع</button>
              <button disabled={!videoStep2Done} onClick={() => setActiveStep(3)}
                className="btn-gold flex-1 disabled:opacity-40">التالي ←</button>
            </div>
          </>
        )}

        {/* ── Step 3: التدريب ── */}
        {activeStep === 3 && (
          <>
            <div className="alert-gold">ابدأ هذه التدريبات فور التسجيل — كل واحدة تقرّبك من أول نتيجة</div>
            <div className="space-y-3">
              {TRAININGS.map(t => (
                <div key={t.id}
                  onClick={() => toggleTrain(t.id)}
                  className={`card flex items-center gap-3 cursor-pointer transition-all
                    ${donedTrainings.has(t.id) ? 'border-[#1D9E75] border-2 bg-[#E1F5EE]' : 'hover:border-[#D4A017]'}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm
                    ${donedTrainings.has(t.id) ? 'bg-[#1D9E75] text-white' : 'bg-[#E6F1FB] text-[#1A5FBE]'}`}>
                    {donedTrainings.has(t.id) ? '✓' : TRAININGS.indexOf(t) + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${donedTrainings.has(t.id) ? 'text-[#0F6E56]' : 'text-gray-900'}`}>{t.title}</p>
                    <p className="text-xs text-gray-400">{t.duration}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full
                    ${donedTrainings.has(t.id) ? 'bg-[#E1F5EE] text-[#0F6E56]'
                    : t.level === 'أساسي' ? 'badge-blue' : 'badge-gold'}`}>
                    {donedTrainings.has(t.id) ? 'مكتمل' : t.level}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-center text-gray-400">
              {donedTrainings.size < 2 ? `أكمل ${2 - donedTrainings.size} تدريبات على الأقل` : '✓ تدريبات كافية — يمكنك المتابعة'}
            </p>
            <div className="flex gap-3">
              <button className="btn-outline flex-1" onClick={() => setActiveStep(2)}>→ رجوع</button>
            </div>

            {/* Final CTA */}
            {allDone && (
              <div className="card-blue text-center mt-4">
                <p className="font-bold text-lg mb-2">أحسنت! أنت جاهز تماماً 🎉</p>
                <p className="text-blue-200 text-sm mb-4">الخطوة الأخيرة هي حجز جلستك الاستراتيجية</p>
                <button onClick={finish} disabled={submitting}
                  className="btn-gold w-full py-3 text-base disabled:opacity-40">
                  {submitting ? 'جارٍ التحضير...' : 'حجز الجلسة الاستراتيجية ←'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── VideoCard component ─────────────────────────────────────
function VideoCard({ id, title, duration, done, onSimulate }: {
  id: string; title: string; duration: string; done: boolean; onSimulate: () => void
}) {
  const [simulating, setSimulating] = useState(false)
  const [progress,   setProgress]   = useState(0)

  function handleSimulate() {
    if (done || simulating) return
    setSimulating(true)
    let p = 0
    const iv = setInterval(() => {
      p += 10
      setProgress(p)
      if (p >= 100) { clearInterval(iv); onSimulate() }
    }, 150)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#E6F1FB] flex items-center justify-center text-base">📱</div>
        <div>
          <p className="font-bold text-gray-900 text-sm">{title}</p>
          <p className="text-xs text-gray-400">{duration} • خطوة بخطوة</p>
        </div>
      </div>
      <div className="bg-[#0a1628] aspect-video flex items-center justify-center">
        {done
          ? <div className="text-center"><div className="text-4xl mb-2">✅</div><p className="text-[#1D9E75] font-bold text-sm">اكتملت المشاهدة</p></div>
          : <div className="text-center cursor-pointer" onClick={handleSimulate}>
              <div className="w-12 h-12 rounded-full border-2 border-[#D4A017]/60 flex items-center justify-center mx-auto mb-2">
                <div className="w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-l-[16px] border-l-[#D4A017] ml-1" />
              </div>
              <p className="text-white/60 text-xs">اضغط للمشاهدة</p>
            </div>
        }
      </div>
      <div className="h-1 bg-gray-100">
        <div className="h-full bg-[#D4A017] transition-all duration-300" style={{ width: `${done ? 100 : progress}%` }} />
      </div>
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-400">{done ? '✓ مكتمل' : simulating ? 'جارٍ المشاهدة...' : 'لم تبدأ بعد'}</span>
        {!done && (
          <button onClick={handleSimulate} disabled={simulating}
            className="text-xs font-bold px-3 py-1 rounded-full bg-[#D4A017] text-[#412402] disabled:opacity-50">
            ⚡ محاكاة
          </button>
        )}
      </div>
    </div>
  )
}
