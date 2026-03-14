// lib/survey-scoring.ts
// Auto-filter logic for survey answers

export interface SurveyAnswers {
  q5_financial_satisfaction: 'yes' | 'somewhat' | 'no'
  q6_own_project: 'yes' | 'no' | 'never_thought'
  q7_project_specs: string
  q8_open_new_fields: 'yes' | 'no' | 'depends'
  q9_willing_to_learn: 'yes' | 'no'
  q10_career_view: string
  q11_ready_to_grab: 'yes' | 'no' | 'absolutely'
  q12_desired_income: '1000-2000' | '2000-4000' | '4000+'
  q13_income_impact: string
  q14_daily_time: '1-2h' | '2-4h' | '4h+'
  q15_patience_duration: '1-3months' | '3-6months' | '6-12months' | 'patient'
  q16_ready_to_start: string
}

export interface ScoringResult {
  totalScore: number
  decision: 'PASS' | 'REVIEW' | 'FAIL'
  breakdown: Record<string, number>
}

const SCORING_MAP: Record<string, Record<string, number>> = {
  q5_financial_satisfaction: { yes: -10, somewhat: 5, no: 0 },
  q6_own_project:            { yes: 10, no: 0, never_thought: 3 },
  q8_open_new_fields:        { yes: 10, no: 0, depends: 5 },
  q9_willing_to_learn:       { yes: 15, no: -10 },
  q11_ready_to_grab:         { yes: 10, no: -20, absolutely: 15 },
  q12_desired_income:        { '1000-2000': 5, '2000-4000': 10, '4000+': 15 },
  q14_daily_time:            { '1-2h': 3, '2-4h': 10, '4h+': 15 },
  q15_patience_duration:     { '1-3months': -15, '3-6months': 5, '6-12months': 10, patient: 20 },
}

export function scoreSurvey(answers: SurveyAnswers): ScoringResult {
  const breakdown: Record<string, number> = {}
  let totalScore = 0

  for (const [field, scoreMap] of Object.entries(SCORING_MAP)) {
    const answer = answers[field as keyof SurveyAnswers] as string
    const points = scoreMap[answer] ?? 0
    breakdown[field] = points
    totalScore += points
  }

  // Open text bonus: reward thoughtful answers
  if (answers.q7_project_specs?.length > 30) { breakdown.q7_bonus = 5; totalScore += 5 }
  if (answers.q13_income_impact?.length > 30) { breakdown.q13_bonus = 5; totalScore += 5 }
  if (answers.q16_ready_to_start?.toLowerCase().includes('نعم') ||
      answers.q16_ready_to_start?.toLowerCase().includes('yes')) {
    breakdown.q16_bonus = 10; totalScore += 10
  }

  let decision: 'PASS' | 'REVIEW' | 'FAIL'
  if (totalScore >= 60)      decision = 'PASS'
  else if (totalScore >= 30) decision = 'REVIEW'
  else                       decision = 'FAIL'

  return { totalScore, decision, breakdown }
}
