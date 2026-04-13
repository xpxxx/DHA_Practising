import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Bank, MockSession, Question } from '../types'
import { getQuestionById, loadBank } from '../bank'
import { DOMAIN_LABEL, difficultyLabel } from '../taxonomy'
import { loadUserState, upsertMockSession } from '../storage'
import { clamp, nowIso } from '../utils'
import { useDisplayMode } from './useDisplayMode'

function pickByWeights(weights: Partial<Record<string, number>>): string[] {
  const entries = Object.entries(weights).filter(([, w]) => (w ?? 0) > 0) as [string, number][]
  const pool: string[] = []
  entries.forEach(([k, w]) => {
    for (let i = 0; i < Math.min(10, Math.max(0, Math.floor(w))); i++) pool.push(k)
  })
  return pool.length ? pool : entries.map(([k]) => k)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function ensureQueue(bank: Bank, session: MockSession): MockSession {
  if (session.questionIds.length) return session
  const pool = pickByWeights(session.config.domains)
  const byDomain = new Map<string, Question[]>()
  bank.questions.forEach((q) => {
    const list = byDomain.get(q.domain) ?? []
    list.push(q)
    byDomain.set(q.domain, list)
  })
  const ids: string[] = []
  const seen = new Set<string>()
  const shuffledDomains = shuffle(pool)
  for (let i = 0; i < session.config.count; i++) {
    const d = shuffledDomains[i % shuffledDomains.length]
    const list = byDomain.get(d) ?? []
    const candidates = shuffle(list).filter((q) => !seen.has(q.id))
    const picked = candidates[0] ?? shuffle(bank.questions).find((q) => !seen.has(q.id))
    if (!picked) break
    seen.add(picked.id)
    ids.push(picked.id)
  }
  return { ...session, questionIds: ids, idx: 0 }
}

export function MockSessionPage() {
  const displayMode = useDisplayMode()
  const { id } = useParams()
  const [bank, setBank] = useState<Bank | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    loadBank().then(setBank).catch((e: unknown) => setError(String(e)))
  }, [])

  const session: MockSession | null = useMemo(() => {
    const st = loadUserState()
    if (!id) return null
    return st.mockSessions.find((s) => s.id === id) ?? null
  }, [id, tick])

  const hydrated = useMemo(() => {
    if (!bank || !session) return null
    return ensureQueue(bank, session)
  }, [bank, session])

  const current: Question | null = useMemo(() => {
    if (!bank || !hydrated) return null
    const qid = hydrated.questionIds[hydrated.idx]
    if (!qid) return null
    return getQuestionById(bank, qid) ?? null
  }, [bank, hydrated])

  const [showKeyPoints, setShowKeyPoints] = useState(false)

  function updateSession(next: MockSession) {
    upsertMockSession(next)
    setTick((n) => n + 1)
  }

  function rate(value: 1 | 2 | 3 | 4 | 5) {
    if (!hydrated || !current) return
    updateSession({
      ...hydrated,
      ratings: { ...hydrated.ratings, [current.id]: value },
    })
  }

  function note(text: string) {
    if (!hydrated || !current) return
    updateSession({
      ...hydrated,
      notes: { ...hydrated.notes, [current.id]: text },
    })
  }

  function next() {
    if (!hydrated) return
    const nextIdx = clamp(hydrated.idx + 1, 0, hydrated.questionIds.length)
    const finished = nextIdx >= hydrated.questionIds.length
    updateSession({
      ...hydrated,
      idx: finished ? hydrated.idx : nextIdx,
      finishedAt: finished ? nowIso() : hydrated.finishedAt,
    })
    setShowKeyPoints(false)
    if (finished) navigate('/progress')
  }

  function prev() {
    if (!hydrated) return
    updateSession({ ...hydrated, idx: clamp(hydrated.idx - 1, 0, hydrated.questionIds.length - 1) })
    setShowKeyPoints(false)
  }

  if (error) return <div className="card">Failed to load bank: {error}</div>
  if (!bank || !session) return <div className="card">Loading session…</div>
  if (!hydrated) return <div className="card">Preparing questions…</div>
  if (!current)
    return (
      <div className="stack">
        <div className="card">No questions generated (empty bank or all weights are 0).</div>
        <div className="card">
          <button className="btnPrimary" onClick={() => navigate('/mock')}>
            Back to setup
          </button>
        </div>
      </div>
    )

  const idx = hydrated.idx + 1
  const total = hydrated.questionIds.length
  const currentRating = hydrated.ratings[current.id]

  return (
    <div className="stack">
      <section className="card">
        <div className="rowBetween">
          <Link to="/mock" className="link">
            ← Back to setup
          </Link>
          <div className="muted">
            Question {idx} / {total}
          </div>
        </div>

        <div className="pillRow">
          <span className="pill">{DOMAIN_LABEL[current.domain]}</span>
          <span className="pill">{difficultyLabel(current.difficulty)}</span>
        </div>

        <div className="prompt">{current.prompt.en}</div>
        {displayMode === 'bilingual' && current.prompt.zh ? (
          <div className="muted prompt">{current.prompt.zh}</div>
        ) : null}

        {hydrated.config.showKeyPointsToggle && (
          <label className="check">
            <input
              type="checkbox"
              checked={showKeyPoints}
              onChange={(e) => setShowKeyPoints(e.target.checked)}
            />
            Show key points (training mode)
          </label>
        )}

        {showKeyPoints && (
          <ul className="list">
            {current.keyPoints.map((kp, i) => (
              <li key={i}>
                <div>{kp.en}</div>
                {displayMode === 'bilingual' && kp.zh ? <div className="muted">{kp.zh}</div> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="h2">Self rating (1–5)</h2>
        <div className="rowWrap">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              className={currentRating === v ? 'chip chipOn' : 'chip'}
              onClick={() => rate(v as 1 | 2 | 3 | 4 | 5)}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="muted">Tip: 3 = covered most points; 4 = clear and structured; 5 = confident with follow-ups.</div>
      </section>

      <section className="card">
        <h2 className="h2">Session notes</h2>
        <textarea
          className="textarea"
          value={hydrated.notes[current.id] ?? ''}
          onChange={(e) => note(e.target.value)}
          placeholder="Gaps, phrases, follow-ups, mistakes..."
          rows={5}
        />
      </section>

      <section className="card">
        <div className="rowBetween">
          <button className="btn" onClick={prev} disabled={hydrated.idx <= 0}>
            Previous
          </button>
          <div className="row">
            <Link className="btn" to={`/q/${current.id}`}>
              Open details
            </Link>
            <button className="btnPrimary" onClick={next}>
              {idx >= total ? 'Finish & view progress' : 'Next'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

