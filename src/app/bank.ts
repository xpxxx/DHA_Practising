import type { Bank, Question } from './types'

const SAMPLE_URL = new URL('data/questions.sample.json', import.meta.env.BASE_URL).toString()

export async function loadBank(): Promise<Bank> {
  const res = await fetch(SAMPLE_URL, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to load bank: ${res.status}`)
  const json = (await res.json()) as Bank
  return normalizeBank(json)
}

function normalizeBank(bank: Bank): Bank {
  const questions = (bank.questions ?? []).filter((q): q is Question => Boolean(q?.id))
  return { questions }
}

export function getQuestionById(bank: Bank, id: string): Question | undefined {
  return bank.questions.find((q) => q.id === id)
}
