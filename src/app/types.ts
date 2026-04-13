import type { Difficulty, Domain, Tag } from './taxonomy'

export type QuestionSource =
  | { type: 'pdf'; file: string; page: number }
  | { type: 'manual'; note?: string }

export type BilingualText = {
  en: string
  zh?: string
}

export type Question = {
  id: string
  prompt: BilingualText
  keyPoints: BilingualText[]
  tags: Tag[]
  difficulty: Difficulty
  domain: Domain
  followUps?: string[]
  source: QuestionSource
  updatedAt: string
}

export type Bank = {
  questions: Question[]
}

export type PracticeMode = 'drill' | 'mock'

export type UserQuestionState = {
  favorite?: boolean
  flagged?: boolean
  mastery?: 0 | 1 | 2 | 3 | 4 | 5
  lastPracticedAt?: string
  note?: string
}

export type UserState = {
  version: 1
  questions: Record<string, UserQuestionState>
  mockSessions: MockSession[]
}

export type MockConfig = {
  mode: 'oral'
  domains: Partial<Record<Domain, number>>
  count: number
  showKeyPointsToggle?: boolean
}

export type MockSession = {
  id: string
  startedAt: string
  finishedAt?: string
  config: MockConfig
  questionIds: string[]
  idx: number
  ratings: Partial<Record<string, 1 | 2 | 3 | 4 | 5>>
  notes: Partial<Record<string, string>>
}
