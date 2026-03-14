'use client'
// app/vsl/page.tsx — Phase 2: عرض العمل التفاعلي

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const VSL_DURATION = 18 * 60 // 18 minutes in seconds

export default function VSLPage() {
  const router = useRouter()
  const [elapsed, setElapsed]       = useState(0)
  const [playing, setPlaying]       = useState(false)
  const [completed, setCompleted]   = useState(false)
  const [answer1, setAnswer1]       = useState('')
  const [clarity, setClarity]       = useState(7)
  const [submitting, setSubmitting] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const progress = Math.round((elapsed / VSL_DURATION) * 100)
  const remaining = VSL_DURATION - elapsed
  const fmtTime = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  useEffect(() => {
    if (playing && !completed) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev >= VSL_DURATION) {
            setCompleted(true)
            setPlaying(false)
            if (intervalRef.current) clearInterval(intervalRef.current)
            return VSL_DURATION
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing, completed])

  async function submitVSL() {
    if (!answer1) return
    setSubmitting(true)
    try {
      await fetch('/api/funnel/vsl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchPct: 100, answer1, clarityScore: clarity }),
        credentials: 'include',
      })
      router.push('/register')
    } catch {
      setSubmitting(false)
    }
  }

  const LIKE_OPTIONS = [
    'إمكانية العمل من أي مكان وبدون قيود',
    'لا يحتاج خبرة مسبقة للبدء',
    'نظام الدخل المتكرر والمتراكم',
    'وجود فريق ودعم حقيقي',
    'سرعة البدء ووضوح الخطوات',
  ]

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">

      {/* Header */}
      <header className="bg-[#1A5FBE] px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-white font-black text-base">عرض العمل الكامل</p>
          <p className="text-blue-200 text-xs">المرحلة 2 من 4</p>
        </div>
        <div className="badge-blue text-xs">🔒 مشاهدة إلزامية</div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-5">

        {/* Video Player */}
        <div className="bg-[#0a1628] rounded-2xl overflow-hidden shadow-blue">

          {/* Screen */}
          <div
            className="aspect-video flex flex-col items-center justify-center cursor-pointer relative"
            onClick={() => !completed && setPlaying(!playing)}>

            {!playing && !completed && (
              <>
                <div className="w-16 h-16 rounded-full border-2 border-[#D4A017]/60 flex items-center justify-center mb-3">
                  <div className="w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[22px] border-l-[#D4A017] ml-1" />
                </div>
                <p className="text-white/70 text-sm">اضغط لمشاهدة عرض العمل الكامل</p>
                <p className="text-white/40 text-xs mt-1">مدة الفيديو: 18 دقيقة</p>
              </>
            )}

            {playing && !completed && (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center mb-2 mx-auto">
                  <div className="w-3 h-6 border-x-2 border-white mx-auto" />
                </div>
                <p className="text-white/60 text-sm">جارٍ التشغيل...</p>
              </div>
            )}

            {completed && (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-[#1D9E75]/20 flex items-center justify-center mb-3 mx-auto">
                  <span className="text-[#1D9E75] text-2xl font-black">✓</span>
                </div>
                <p className="text-[#1D9E75] font-bold">اكتملت المشاهدة!</p>
              </div>
            )}

            {/* Top badge */}
            {completed && (
              <div className="absolute top-3 right-3 bg-[#1D9E75] text-white text-xs px-3 py-1 rounded-full font-bold">
                ✓ تمت المشاهدة
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-[#0d1f3c] px-4 py-3">
            <div className="flex justify-between text-xs text-white/40 mb-2">
              <span>{fmtTime(elapsed)}</span>
              <span>عرض العمل — RBU Network</span>
              <span>{fmtTime(remaining)}</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-[#D4A017] rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">
                {completed ? '✓ مكتمل' : playing ? '▶ يعمل...' : '⏸ متوقف'}
              </span>
              {!completed && (
                <button onClick={() => setPlaying(!playing)}
                  className="text-xs font-bold px-4 py-1.5 rounded-full bg-[#D4A017] text-[#412402]">
                  {playing ? 'إيقاف مؤقت' : '▶ تشغيل'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* What you'll learn */}
        <div className="card">
          <p className="font-bold text-gray-800 text-sm mb-3">ما ستتعلمه في هذا العرض</p>
          <div className="space-y-2">
            {[
              'كيف يعمل النظام وما هي الفرصة المتاحة اليوم',
              'الفرق بين هذا النظام وأي عمل تقليدي آخر',
              'كيف تبني دخلاً إضافياً بدون رأس مال كبير',
              'الخطوات العملية للبدء الفعلي من اليوم الأول',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-[#FAEEDA] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4A017]" />
                </div>
                <p className="text-sm text-gray-600">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Questions — locked until complete */}
        <div className={`space-y-4 transition-opacity duration-500 ${completed ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>

          {!completed && (
            <div className="alert-gold text-center">
              🔒 ستُفتح الأسئلة بعد مشاهدة الفيديو كاملاً
            </div>
          )}
          {completed && (
            <div className="alert-green text-center">
              ✓ رائع! أجب على سؤالين قصيرين للمتابعة
            </div>
          )}

          {/* Q1 */}
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">السؤال 1 — بعد المشاهدة</p>
            <p className="font-bold text-gray-900 text-sm mb-4">ما هو أكثر شيء أعجبك في هذا العرض؟</p>
            <div className="space-y-2">
              {LIKE_OPTIONS.map(opt => (
                <button key={opt} onClick={() => setAnswer1(opt)}
                  className={`opt-btn ${answer1 === opt ? 'opt-btn-selected' : ''}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Q2 */}
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">السؤال 2 — تقييم الوضوح</p>
            <p className="font-bold text-gray-900 text-sm mb-4">
              على سلّم من 1 إلى 10، ما مدى وضوح الرؤية بالنسبة لك الآن؟
            </p>
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>غير واضح</span>
              <span>واضح جداً</span>
            </div>
            <input type="range" min="1" max="10" value={clarity}
              onChange={e => setClarity(Number(e.target.value))}
              className="w-full mb-2" />
            <p className="text-center text-2xl font-black text-[#1A5FBE]">{clarity} / 10</p>
          </div>

          {/* CTA */}
          {completed && (
            <button onClick={submitVSL} disabled={!answer1 || submitting}
              className="btn-gold w-full py-4 text-base disabled:opacity-40">
              {submitting ? 'جارٍ الحفظ...' : 'الانتقال لخطوات التسجيل ←'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
