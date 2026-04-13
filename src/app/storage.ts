import type { MockSession, UserQuestionState, UserState } from './types'

const KEY = 'dha:userState:v1'

const EMPTY: UserState = { version: 1, questions: {}, mockSessions: [] }

export function loadUserState(): UserState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<UserState>
    if (parsed.version !== 1) return EMPTY
    return {
      version: 1,
      questions: parsed.questions ?? {},
      mockSessions: parsed.mockSessions ?? [],
    }
  } catch {
    return EMPTY
  }
}

export function saveUserState(state: UserState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function updateQuestionState(
  questionId: string,
  updater: (prev: UserQuestionState | undefined) => UserQuestionState,
): UserState {
  const state = loadUserState()
  const next = updater(state.questions[questionId])
  const newState: UserState = {
    ...state,
    questions: { ...state.questions, [questionId]: next },
  }
  saveUserState(newState)
  return newState
}

export function upsertMockSession(session: MockSession): UserState {
  const state = loadUserState()
  const idx = state.mockSessions.findIndex((s) => s.id === session.id)
  const nextSessions =
    idx >= 0
      ? state.mockSessions.map((s, i) => (i === idx ? session : s))
      : [session, ...state.mockSessions].slice(0, 50)
  const newState: UserState = { ...state, mockSessions: nextSessions }
  saveUserState(newState)
  return newState
}
