'use client'
// app/dashboard/page.tsx — لوحة تحكم المدير

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const STAGE_LABELS: Record<string, string> = {
  LANDING: 'زيارة', SURVEY: 'استبيان', VSL: 'شاهد العرض',
  REGISTRATION: 'مسجّل', SESSION: 'جلسة محجوزة', PARTNER: 'شريك'
}
const STAGE_COLORS: Record<string, string> = {
  LANDING: 'badge-gray', SURVEY: 'badge-gold', VSL: 'badge-blue',
  REGISTRATION: 'badge-blue', SESSION: 'badge-green', PARTNER: 'badge-green'
}

const DEMO_DATA = {
  kpi: { totalCandidates: 284, newThisMonth: 23, activePartners: 47, newPartnersMonth: 6, sessionsThisWeek: 18, activeSubscriptions: 38, revenueThisMonth: 4230 },
  funnelStats: { LANDING: 1240, SURVEY: 680, VSL: 412, REGISTRATION: 186, SESSION: 94, PARTNER: 47 },
  alerts: { expiringSubscriptions: [
    { name: 'كريم المنصوري', phone: '+21622009001', endDate: '2026-03-16', plan: 'MONTHLY' },
    { name: 'فاطمة العيساوي', phone: '+21622009002', endDate: '2026-03-17', plan: 'MONTHLY' },
  ]},
  recentCandidates: [
    { id: '1', name: 'ياسمين الحاج',   phone: '+21622001001', stage: 'SESSION',       score: 92, createdAt: '2026-03-13' },
    { id: '2', name: 'نادر الزيتوني',  phone: '+21622001002', stage: 'REGISTRATION',  score: 78, createdAt: '2026-03-12' },
    { id: '3', name: 'إيمان بوعزيزي', phone: '+21622001003', stage: 'VSL',           score: 65, createdAt: '2026-03-11' },
    { id: '4', name: 'وليد المختار',   phone: '+21622001004', stage: 'VSL',           score: 70, createdAt: '2026-03-11' },
    { id: '5', name: 'سلوى الرحموني', phone: '+21622001005', stage: 'SURVEY',        score: 55, createdAt: '2026-03-14' },
    { id: '6', name: 'حمزة الشابي',   phone: '+21622001006', stage: 'SURVEY',        score: 48, createdAt: '2026-03-14' },
  ]
}

const SESSIONS = [
  { day: 15, month: 'مار', name: 'ياسمين الحاج',   time: '10:00 ص', method: 'واتساب', status: 'today' },
  { day: 16, month: 'مار', name: 'نادر الزيتوني',  time: '03:00 م', method: 'زووم',    status: 'tomorrow' },
  { day: 17, month: 'مار', name: 'إيمان بوعزيزي', time: '11:00 ص', method: 'هاتف',    status: 'upcoming' },
  { day: 18, month: 'مار', name: 'وليد المختار',   time: '05:00 م', method: 'زووم',    status: 'upcoming' },
]

const PARTNERS = [
  { initials: 'سم', name: 'سمر التليلي',   city: 'تونس',  team: 8,  plan: 'سنوي',  income: '+3,200د', status: 'active' },
  { initials: 'مح', name: 'محمد الغزواني', city: 'صفاقس', team: 5,  plan: 'سنوي',  income: '+1,800د', status: 'active' },
  { initials: 'رن', name: 'رنا بن عمر',    city: 'سوسة',  team: 12, plan: 'شهري',  income: '+4,600د', status: 'active' },
  { initials: 'كر', name: 'كريم المنصوري', city: 'بنزرت', team: 3,  plan: 'شهري',  income: '+920د',   status: 'expiring' },
]

export default function DashboardPage() {
  const [tab, setTab] = useState(0)
  const [filter, setFilter] = useState('all')
  const d = DEMO_DATA

  const funnelStages = [
    { key: 'LANDING', label: 'زوار الصفحة', val: 1240, pct: 100, color: '#1A5FBE' },
    { key: 'SURVEY',  label: 'أكملوا الاستبيان', val: 680, pct: 55, color: '#D4A017' },
    { key: 'VSL',     label: 'شاهدوا عرض العمل', val: 412, pct: 33, color: '#1D9E75' },
    { key: 'REGISTRATION', label: 'سجّلوا في RBU', val: 186, pct: 15, color: '#993C1D' },
    { key: 'SESSION', label: 'حجزوا جلسة', val: 94, pct: 8, color: '#D4A017' },
    { key: 'PARTNER', label: 'شركاء فاعلون', val: 47, pct: 4, color: '#1D9E75' },
  ]

  const filteredCandidates = filter === 'all'
    ? d.recentCandidates
    : d.recentCandidates.filter(c => c.stage === filter)

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="font-black text-gray-900 text-base">لوحة التحكم</p>
          <p className="text-xs text-gray-400">RBU Network — مارس 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-sm cursor-pointer">
            🔔 <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#993C1D]" />
          </div>
          <div className="w-8 h-8 rounded-full bg-[#1A5FBE] flex items-center justify-center text-white text-xs font-black">أح</div>
        </div>
      </header>

      {/* Page tabs */}
      <div className="flex bg-white border-b border-gray-100 overflow-x-auto">
        {['نظرة عامة','المرشحون','الشركاء','الجلسات','الإيرادات'].map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors
              ${tab === i ? 'text-[#1A5FBE] border-b-2 border-[#1A5FBE]' : 'text-gray-400'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">

        {/* ── Overview ── */}
        {tab === 0 && (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'إجمالي المرشحين', val: d.kpi.totalCandidates, change: `+${d.kpi.newThisMonth} هذا الشهر`, icon: '👥', color: '#1A5FBE', bg: '#E6F1FB' },
                { label: 'شركاء نشطون',     val: d.kpi.activePartners,  change: `+${d.kpi.newPartnersMonth} هذا الشهر`, icon: '✓', color: '#1D9E75', bg: '#E1F5EE' },
                { label: 'جلسات الأسبوع',   val: d.kpi.sessionsThisWeek, change: '+4 من الأسبوع الماضي', icon: '📅', color: '#D4A017', bg: '#FAEEDA' },
                { label: 'إيراد الاشتراكات', val: `${d.kpi.revenueThisMonth.toLocaleString()}د`, change: '+12% هذا الشهر', icon: '💰', color: '#993C1D', bg: '#FAECE7' },
              ].map((k, i) => (
                <div key={i} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">{k.label}</span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs" style={{ background: k.bg }}>{k.icon}</div>
                  </div>
                  <p className="text-2xl font-black" style={{ color: k.color }}>{k.val}</p>
                  <p className="text-xs font-semibold text-[#1D9E75] mt-1">{k.change}</p>
                </div>
              ))}
            </div>

            {/* Funnel stats */}
            <div className="card">
              <p className="font-bold text-gray-900 text-sm mb-4">معدلات تحويل القمع — مارس 2026</p>
              <div className="space-y-3">
                {funnelStages.map(s => (
                  <div key={s.key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{s.label}</span>
                      <span className="font-bold text-gray-900">{s.val.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">معدل التحويل الإجمالي</span>
                <span className="text-sm font-black text-[#1D9E75]">3.8%</span>
              </div>
            </div>

            {/* Alerts */}
            <div className="space-y-2">
              <p className="sec-label">تنبيهات تحتاج إجراء</p>
              {d.alerts.expiringSubscriptions.map((a, i) => (
                <div key={i} className="alert-red flex items-center justify-between gap-3">
                  <span className="flex-1 text-xs"><b>{a.name}</b> — اشتراك ينتهي {a.endDate}</span>
                  <button onClick={() => setTab(4)} className="text-xs font-bold px-3 py-1 rounded-lg bg-[#993C1D] text-white">تذكير</button>
                </div>
              ))}
              <div className="alert-gold flex items-center justify-between gap-3">
                <span className="flex-1 text-xs">5 مرشحين أكملوا الاستبيان ولم يشاهدوا العرض بعد</span>
                <button onClick={() => setTab(1)} className="text-xs font-bold px-3 py-1 rounded-lg bg-[#D4A017] text-[#412402]">متابعة</button>
              </div>
            </div>
          </>
        )}

        {/* ── Candidates ── */}
        {tab === 1 && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[['all','الكل'],['SURVEY','الاستبيان'],['VSL','العرض'],['REGISTRATION','مسجّل'],['SESSION','جلسة']].map(([v,l]) => (
                <button key={v} onClick={() => setFilter(v)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap border transition-all
                    ${filter === v ? 'bg-[#1A5FBE] text-white border-[#1A5FBE]' : 'bg-white text-gray-500 border-gray-200'}`}>
                  {l}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {filteredCandidates.map(c => (
                <div key={c.id} className="card flex items-center gap-3 cursor-pointer hover:border-[#1A5FBE] transition-all">
                  <div className="w-9 h-9 rounded-full bg-[#E6F1FB] flex items-center justify-center text-xs font-bold text-[#1A5FBE] flex-shrink-0">
                    {c.name.slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.phone}</p>
                    <div className="flex gap-1 mt-1">
                      {['SURVEY','VSL','REGISTRATION','SESSION'].map((s,i) => (
                        <div key={i} className={`h-1 w-4 rounded-full ${
                          i < ['SURVEY','VSL','REGISTRATION','SESSION'].indexOf(c.stage) + 1 ? 'bg-[#1D9E75]' : 'bg-gray-200'
                        }`} />
                      ))}
                    </div>
                  </div>
                  <span className={`text-xs ${STAGE_COLORS[c.stage] || 'badge-gray'}`}>{STAGE_LABELS[c.stage]}</span>
                  <span className="text-sm font-black text-[#1A5FBE]">{c.score}%</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Partners ── */}
        {tab === 2 && (
          <div className="space-y-3">
            <p className="sec-label">الشركاء النشطون — {d.kpi.activePartners} شريك</p>
            {PARTNERS.map((p, i) => (
              <div key={i} className="card flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: ['#E6F1FB','#E1F5EE','#FAEEDA','#FAECE7'][i], color: ['#1A5FBE','#0F6E56','#854F0B','#993C1D'][i] }}>
                  {p.initials}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.team} شركاء مباشرين • {p.city}</p>
                </div>
                <span className={`text-xs font-semibold ${p.status === 'expiring' ? 'badge-red' : 'badge-green'}`}>
                  {p.status === 'expiring' ? '⚠ ينتهي' : p.plan}
                </span>
                <div className="text-left">
                  <p className="text-sm font-black text-[#1D9E75]">{p.income}</p>
                  <p className="text-xs text-gray-400">هذا الشهر</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Sessions ── */}
        {tab === 3 && (
          <div className="space-y-3">
            <p className="sec-label">جلسات هذا الأسبوع</p>
            {SESSIONS.map((s, i) => (
              <div key={i} className="card flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0
                  ${s.status === 'today' ? 'bg-[#E1F5EE]' : 'bg-[#E6F1FB]'}`}>
                  <span className={`text-lg font-black leading-none ${s.status === 'today' ? 'text-[#1D9E75]' : 'text-[#1A5FBE]'}`}>{s.day}</span>
                  <span className="text-xs font-semibold text-gray-400">{s.month}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.time} • {s.method}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full
                  ${s.status === 'today' ? 'bg-[#E1F5EE] text-[#0F6E56]'
                  : s.status === 'tomorrow' ? 'badge-blue'
                  : 'badge-gray'}`}>
                  {s.status === 'today' ? 'اليوم' : s.status === 'tomorrow' ? 'غداً' : 'قادم'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Revenue ── */}
        {tab === 4 && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: `${d.kpi.revenueThisMonth.toLocaleString()}د`, label: 'إيراد مارس', color: '#1D9E75' },
                { val: d.kpi.activeSubscriptions, label: 'اشتراكات نشطة', color: '#1A5FBE' },
                { val: d.alerts.expiringSubscriptions.length, label: 'تنتهي قريباً', color: '#993C1D' },
              ].map((r, i) => (
                <div key={i} className="card text-center">
                  <p className="text-xl font-black" style={{ color: r.color }}>{r.val}</p>
                  <p className="text-xs text-gray-400 mt-1">{r.label}</p>
                </div>
              ))}
            </div>
            <p className="sec-label">تنبيهات التجديد</p>
            {d.alerts.expiringSubscriptions.map((a, i) => (
              <div key={i} className="alert-red flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-sm">{a.name}</p>
                  <p className="text-xs opacity-75">اشتراك {a.plan === 'MONTHLY' ? 'شهري' : 'سنوي'} — ينتهي {a.endDate}</p>
                </div>
                <button className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#993C1D] text-white">إرسال تذكير</button>
              </div>
            ))}
            <p className="sec-label">آخر المدفوعات</p>
            {PARTNERS.slice(0,4).map((p, i) => (
              <div key={i} className="card flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.plan} • {p.city}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-[#1D9E75]">
                    {p.plan === 'سنوي' ? '+790د' : '+89د'}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.status === 'expiring' ? 'badge-red' : 'badge-green'}`}>
                    {p.status === 'expiring' ? 'قريب الانتهاء' : 'مدفوع'}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
