'use client'
// app/booking/page.tsx — Phase 4: حجز الجلسة الاستراتيجية

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const METHODS = [
  { id: 'WHATSAPP', label: 'واتساب', icon: '💬', sub: 'رسالة + مكالمة' },
  { id: 'ZOOM',     label: 'زووم',   icon: '🎥', sub: 'فيديو كول'     },
  { id: 'PHONE',    label: 'هاتف',   icon: '📞', sub: 'مكالمة مباشرة' },
]

const TIMES = ['09:00', '10:00', '11:00', '12:00', '15:00', '17:00', '19:00', '20:00']
const BUSY  = [1, 4] // indices of busy slots

const MONTH_NAMES = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
const DAY_NAMES   = ['أح','إث','ثل','أر','خم','جم','سب']

function getCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return { firstDay, daysInMonth }
}

export default function BookingPage() {
  const router = useRouter()
  const now = new Date()
  const [year, setYear]     = useState(now.getFullYear())
  const [month, setMonth]   = useState(now.getMonth())
  const [method, setMethod] = useState('')
  const [selDay, setSelDay] = useState<number | null>(null)
  const [selTime, setSelTime] = useState('')
  const [booked, setBooked]   = useState(false)
  const [loading, setLoading] = useState(false)

  const { firstDay, daysInMonth } = getCalendar(year, month)

  function changeMonth(dir: number) {
    let m = month + dir, y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0)  { m = 11; y-- }
    setMonth(m); setYear(y)
    setSelDay(null); setSelTime('')
  }

  function isDisabled(day: number) {
    const d = new Date(year, month, day)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return d < today || d.getDay() === 5
  }

  const isToday = (day: number) => {
    const d = new Date(year, month, day)
    return d.toDateString() === now.toDateString()
  }

  const canBook = method && selDay && selTime

  async function confirmBook() {
    if (!canBook) return
    setLoading(true)
    try {
      const scheduledAt = new Date(year, month, selDay!, parseInt(selTime)).toISOString()
      await fetch('/api/sessions/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId: 'demo-partner-id', scheduledAt, contactMethod: method }),
        credentials: 'include',
      })
      setBooked(true)
    } catch { setLoading(false) }
  }

  if (booked) return <SuccessScreen day={selDay!} month={month} year={year} time={selTime} method={method} onNext={() => router.push('/partner/ahmed-bensalem')} />

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">

      {/* Header */}
      <header className="bg-[#993C1D] px-5 py-4">
        <p className="text-white font-black text-base">الإغلاق والتخطيط</p>
        <p className="text-orange-200 text-xs">المرحلة 4 من 4 — الأخيرة</p>
      </header>

      {/* Achievement strip */}
      <div className="bg-white border-b border-gray-100 px-5 py-3 flex gap-2 overflow-x-auto">
        {['✓ اجتاز الاستبيان','✓ شاهد العرض','✓ سجّل في RBU','⟳ حجز الجلسة'].map((a, i) => (
          <span key={i} className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap
            ${i < 3 ? 'badge-green' : 'badge-gold'}`}>{a}</span>
        ))}
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-5">

        {/* Method */}
        <div>
          <p className="sec-label">اختر وسيلة التواصل المفضلة</p>
          <div className="grid grid-cols-3 gap-3">
            {METHODS.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={`card text-center py-4 transition-all cursor-pointer
                  ${method === m.id ? 'border-[#D4A017] border-2 bg-[#FAEEDA]' : 'hover:border-gray-300'}`}>
                <div className="text-2xl mb-1">{m.icon}</div>
                <p className="font-bold text-gray-900 text-xs">{m.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{m.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div>
          <p className="sec-label">اختر يوم الجلسة</p>
          <div className="card p-0 overflow-hidden">
            {/* Cal header */}
            <div className="bg-[#1A5FBE] px-4 py-3 flex items-center justify-between">
              <div className="flex gap-2">
                <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-lg bg-white/20 text-white text-sm flex items-center justify-center">›</button>
                <button onClick={() => changeMonth(1)}  className="w-8 h-8 rounded-lg bg-white/20 text-white text-sm flex items-center justify-center">‹</button>
              </div>
              <p className="text-white font-bold text-sm">{MONTH_NAMES[month]} {year}</p>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 px-3 pt-3 pb-1">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-center text-xs text-gray-400 font-semibold py-1">{d}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 px-3 pb-3 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dis = isDisabled(day)
                const tod = isToday(day)
                const sel = selDay === day
                return (
                  <button key={day} disabled={dis}
                    onClick={() => { setSelDay(day); setSelTime('') }}
                    className={`aspect-square rounded-xl text-xs font-semibold transition-all
                      ${dis ? 'text-gray-200 cursor-not-allowed'
                      : sel ? 'bg-[#D4A017] text-[#412402] font-black'
                      : tod ? 'border-2 border-[#1A5FBE] text-[#1A5FBE] font-black'
                      : 'text-gray-700 hover:bg-gray-100'}`}>
                    {day}
                  </button>
                )
              })}
            </div>

            {/* Time slots */}
            {selDay && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 mb-3">اختر وقت يوم {selDay} {MONTH_NAMES[month]}</p>
                <div className="grid grid-cols-4 gap-2">
                  {TIMES.map((t, i) => {
                    const busy = BUSY.includes(i)
                    return (
                      <button key={t} disabled={busy}
                        onClick={() => setSelTime(t)}
                        className={`py-2 rounded-xl text-xs font-semibold transition-all
                          ${busy ? 'text-gray-300 line-through cursor-not-allowed bg-gray-50'
                          : selTime === t ? 'bg-[#D4A017] text-[#412402] border-2 border-[#D4A017]'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}>
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {canBook && (
          <div className="card space-y-3">
            {[
              { icon: '📅', key: 'التاريخ', val: `${selDay} ${MONTH_NAMES[month]} ${year}` },
              { icon: '🕐', key: 'الوقت',   val: `${selTime} صباحاً/مساءً` },
              { icon: '💬', key: 'التواصل', val: METHODS.find(m => m.id === method)?.label || '' },
              { icon: '⏱',  key: 'المدة',   val: '30 دقيقة — جلسة تخطيط استراتيجي' },
            ].map(r => (
              <div key={r.key} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <span className="text-base">{r.icon}</span>
                <span className="text-xs text-gray-400 w-16 flex-shrink-0">{r.key}</span>
                <span className="text-sm font-semibold text-gray-900 flex-1">{r.val}</span>
              </div>
            ))}
          </div>
        )}

        <button onClick={confirmBook} disabled={!canBook || loading}
          className="btn-gold w-full py-4 text-base disabled:opacity-40">
          {loading ? 'جارٍ التأكيد...' : 'تأكيد حجز الجلسة ✓'}
        </button>
      </div>
    </div>
  )
}

function SuccessScreen({ day, month, year, time, method, onNext }: {
  day: number; month: number; year: number; time: string; method: string; onNext: () => void
}) {
  const MONTH_NAMES = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
  const METHOD_LABELS: Record<string, string> = { WHATSAPP: 'واتساب', ZOOM: 'زووم', PHONE: 'هاتف' }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5 text-center" dir="rtl">
      <div className="w-20 h-20 rounded-full bg-[#E1F5EE] flex items-center justify-center mb-5 text-4xl">✓</div>
      <h1 className="text-xl font-black text-[#0F6E56] mb-2">تم حجز جلستك بنجاح!</h1>
      <p className="text-gray-500 text-sm mb-6">سيتواصل معك قائد فريقك قبل الجلسة بـ 24 ساعة للتأكيد</p>
      <div className="card w-full max-w-sm text-right mb-5 bg-[#E1F5EE] border-[#1D9E75]">
        <p className="font-black text-[#0F6E56] text-sm">{day} {MONTH_NAMES[month]} {year} — {time}</p>
        <p className="text-[#3B6D11] text-xs mt-1">عبر {METHOD_LABELS[method]}</p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {['✓ تأكيد بالإيميل','✓ تذكير قبل 3 أيام','✓ تذكير قبل يوم'].map(b => (
          <span key={b} className="badge-green text-xs">{b}</span>
        ))}
      </div>
      <div className="card-blue w-full max-w-sm text-center">
        <h3 className="font-black text-lg mb-1">مرحباً بك في الفريق رسمياً 🎉</h3>
        <p className="text-blue-200 text-sm mb-4">أكملت كل المراحل — أنت الآن شريك فاعل</p>
        <button onClick={onNext} className="btn-gold w-full py-3">عرض صفحتي كشريك ←</button>
      </div>
    </div>
  )
}
