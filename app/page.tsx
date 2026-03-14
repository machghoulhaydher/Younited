'use client'
// app/page.tsx — Landing Page (Phase 1: الاستبيان)

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const QUESTIONS = [
  // Personal info
  { id: 'firstName', type: 'text',   label: 'الاسم', placeholder: 'أدخل اسمك...',     section: 'info' },
  { id: 'lastName',  type: 'text',   label: 'اللقب', placeholder: 'أدخل لقبك...',     section: 'info' },
  { id: 'phone',     type: 'tel',    label: 'رقم الهاتف', placeholder: '+216...',     section: 'info' },
  { id: 'address',   type: 'text',   label: 'المدينة', placeholder: 'مدينتك...',      section: 'info' },
  // Survey
  {
    id: 'q5_financial_satisfaction', type: 'choice', section: 'survey',
    label: 'هل أنت راضٍ على وضعيتك المالية الحالية؟',
    options: [{ value: 'yes', label: 'نعم', type: 'bad' }, { value: 'somewhat', label: 'نوعاً ما', type: 'warn' }, { value: 'no', label: 'لا', type: 'good' }]
  },
  {
    id: 'q6_own_project', type: 'choice', section: 'survey',
    label: 'هل فكّرت يوماً أن يكون لديك مشروعك الخاص؟',
    options: [{ value: 'yes', label: 'نعم', type: 'good' }, { value: 'never_thought', label: 'لم يخطر ببالي', type: 'warn' }, { value: 'no', label: 'لا', type: 'bad' }]
  },
  { id: 'q7_project_specs', type: 'textarea', section: 'survey', label: 'ما هي المواصفات التي تريدها في هذا المشروع؟', placeholder: 'اكتب ما يهمك...' },
  {
    id: 'q8_open_new_fields', type: 'choice', section: 'survey',
    label: 'هل أنت منفتح على مجالات جديدة؟',
    options: [{ value: 'yes', label: 'نعم', type: 'good' }, { value: 'depends', label: 'حسب المجال', type: 'warn' }, { value: 'no', label: 'لا', type: 'bad' }]
  },
  {
    id: 'q9_willing_to_learn', type: 'choice', section: 'survey',
    label: 'هل أنت قابل أن تتعلم شيئاً جديداً؟',
    options: [{ value: 'yes', label: 'نعم', type: 'good' }, { value: 'no', label: 'لا', type: 'bad' }]
  },
  { id: 'q10_career_view', type: 'textarea', section: 'survey', label: 'كيف ترى نفسك في آخر تجربة مهنية حالية؟', placeholder: 'صف وضعك المهني الحالي...' },
  {
    id: 'q11_ready_to_grab', type: 'choice', section: 'survey',
    label: 'لو تتوفر لك الفرصة المناسبة، هل أنت مستعد لاقتناصها؟',
    options: [{ value: 'absolutely', label: 'بدون شك!', type: 'good' }, { value: 'yes', label: 'نعم', type: 'good' }, { value: 'no', label: 'لا', type: 'bad' }]
  },
  {
    id: 'q12_desired_income', type: 'choice', section: 'survey',
    label: 'ما هو المبلغ الذي "لو يُضاف لك شهرياً" سيجعلك تعيش بطريقة أحسن؟',
    options: [{ value: '1000-2000', label: 'من 1000د إلى 2000د', type: 'good' }, { value: '2000-4000', label: 'من 2000د إلى 4000د', type: 'good' }, { value: '4000+', label: 'أكثر من 4000د', type: 'good' }]
  },
  { id: 'q13_income_impact', type: 'textarea', section: 'survey', label: 'ماذا يمكن أن يُضيف لك هذا المبلغ في حياتك؟', placeholder: 'صف التغيير الذي ستعيشه...' },
  {
    id: 'q14_daily_time', type: 'choice', section: 'survey',
    label: 'كم من الوقت ستوفّر لهذه الفرصة يومياً؟',
    options: [{ value: '1-2h', label: 'من 1 إلى 2 ساعة', type: 'warn' }, { value: '2-4h', label: 'من 2 إلى 4 ساعات', type: 'good' }, { value: '4h+', label: 'أكثر من 4 ساعات', type: 'good' }]
  },
  {
    id: 'q15_patience_duration', type: 'choice', section: 'survey',
    label: 'ما هي المدة التي ستظل فيها صابراً قبل أن تنسحب؟',
    options: [{ value: '1-3months', label: '1 إلى 3 أشهر', type: 'bad' }, { value: '3-6months', label: '3 إلى 6 أشهر', type: 'warn' }, { value: '6-12months', label: '6 إلى 12 شهر', type: 'good' }, { value: 'patient', label: 'لدي الصبر الكافي', type: 'good' }]
  },
  { id: 'q16_ready_to_start', type: 'textarea', section: 'survey', label: 'إذا وجدت من يعلّمك نظام عمل، هل أنت مستعد أن تبدأ الآن؟', placeholder: 'أجب بصدق...' },
]

const SECTIONS = [
  { id: 'info',   label: 'معلوماتك', count: 4 },
  { id: 'survey', label: 'الاستبيان', count: 12 },
]

type Answer = Record<string, string>

export default function LandingPage() {
  const router = useRouter()
  const [step, setStep]       = useState(0)   // question index
  const [answers, setAnswers] = useState<Answer>({})
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const q = QUESTIONS[step]
  const totalSteps = QUESTIONS.length
  const progress   = Math.round(((step) / totalSteps) * 100)

  const isInfoDone   = step >= 4
  const isSurveyStep = step >= 4

  function pick(value: string) {
    const next = { ...answers, [q.id]: value }
    setAnswers(next)
    setTimeout(() => advance(next), 150)
  }

  function advance(ans = answers) {
    if (step < totalSteps - 1) setStep(step + 1)
    else handleSubmit(ans)
  }

  function back() { if (step > 0) setStep(step - 1) }

  async function handleSubmit(ans = answers) {
    setLoading(true)
    setError('')
    try {
      // 1. Register user
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: ans.firstName,
          lastName:  ans.lastName,
          phone:     ans.phone,
          address:   ans.address,
          password:  ans.phone, // use phone as default password — user can change later
        }),
        credentials: 'include',
      })
      const regData = await regRes.json()
      if (!regRes.ok) { setError(regData.error); setLoading(false); return }

      // 2. Submit survey
      const surveyAnswers = Object.fromEntries(
        Object.entries(ans).filter(([k]) => k.startsWith('q'))
      )
      const surveyRes = await fetch('/api/funnel/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${regData.token}` },
        body: JSON.stringify({ answers: surveyAnswers }),
        credentials: 'include',
      })
      const surveyData = await surveyRes.json()

      if (surveyData.decision === 'PASS') router.push('/vsl')
      else if (surveyData.decision === 'REVIEW') router.push('/pending')
      else router.push('/not-qualified')
    } catch {
      setError('حدث خطأ. يرجى المحاولة مجدداً.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">

      {/* Header */}
      <header className="bg-[#1A5FBE] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-white font-black text-lg">RBU Network</p>
          <p className="text-blue-200 text-xs">قمع الاستقطاب الرقمي</p>
        </div>
        <div className="text-left">
          <p className="text-blue-200 text-xs mb-1">التقدم</p>
          <p className="text-white font-bold text-sm">{progress}%</p>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1.5 bg-blue-900">
        <div className="h-full bg-[#D4A017] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Section tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {SECTIONS.map((s, i) => (
          <div key={s.id}
            className={`flex-1 py-3 text-center text-xs font-bold transition-colors
              ${(i === 0 && step < 4) || (i === 1 && step >= 4)
                ? 'text-[#1A5FBE] border-b-2 border-[#1A5FBE]'
                : 'text-gray-400'}`}>
            {i === 0 && step >= 4 ? '✓ ' : ''}{s.label}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center px-5 py-8 max-w-lg mx-auto w-full">

        {/* Question card */}
        <div className="card mb-6">
          <p className="text-xs text-gray-400 mb-1">
            السؤال {step + 1} من {totalSteps}
            {isSurveyStep && <span className="mr-2 text-[#993C1D]">*إجباري</span>}
          </p>
          <p className="text-base font-bold text-gray-900 leading-relaxed mb-5">{q.label}</p>

          {/* Choice */}
          {q.type === 'choice' && (
            <div className="flex flex-col gap-2">
              {(q as any).options?.map((opt: any) => (
                <button key={opt.value}
                  onClick={() => pick(opt.value)}
                  className={`opt-btn ${answers[q.id] === opt.value
                    ? opt.type === 'good' ? 'opt-btn-good'
                    : opt.type === 'bad'  ? 'opt-btn-bad'
                    : 'opt-btn-selected' : ''}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Text / tel */}
          {(q.type === 'text' || q.type === 'tel') && (
            <div>
              <input
                type={q.type}
                className="input"
                placeholder={(q as any).placeholder}
                value={answers[q.id] || ''}
                onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && answers[q.id] && advance()}
                autoFocus
              />
            </div>
          )}

          {/* Textarea */}
          {q.type === 'textarea' && (
            <textarea
              className="input min-h-[90px] resize-none"
              placeholder={(q as any).placeholder}
              value={answers[q.id] || ''}
              onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
              autoFocus
            />
          )}
        </div>

        {/* Error */}
        {error && <div className="alert-red mb-4">{error}</div>}

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={back} className="btn-outline flex-1">→ رجوع</button>
          )}
          {q.type !== 'choice' && (
            <button
              onClick={() => advance()}
              disabled={!answers[q.id] || loading}
              className="btn-gold flex-1 disabled:opacity-40">
              {loading ? 'جارٍ المعالجة...' : step === totalSteps - 1 ? 'إرسال الاستبيان ✓' : 'التالي ←'}
            </button>
          )}
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300
              ${i === step ? 'w-6 bg-[#1A5FBE]' : i < step ? 'w-3 bg-[#1D9E75]' : 'w-3 bg-gray-200'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
