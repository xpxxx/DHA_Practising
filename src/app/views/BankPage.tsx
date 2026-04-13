import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Bank, Question } from '../types'
import { loadBank } from '../bank'
import { DOMAIN_LABEL, TAG_LABEL, difficultyLabel, type Domain, type Tag } from '../taxonomy'
import { loadUserState, updateQuestionState } from '../storage'
import { useDisplayMode } from './useDisplayMode'

type Filters = {
  q: string
  domain: Domain | 'all'
  difficulty: 1 | 2 | 3 | 'all'
  tag: Tag | 'all'
  onlyFavorites: boolean
  onlyFlagged: boolean
}

const DEFAULT: Filters = {
  q: '',
  domain: 'all',
  difficulty: 'all',
  tag: 'all',
  onlyFavorites: false,
  onlyFlagged: false,
}

export function BankPage() {
  const displayMode = useDisplayMode()
  const [bank, setBank] = useState<Bank | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(DEFAULT)
  const [userTick, setUserTick] = useState(0)

  useEffect(() => {
    loadBank().then(setBank).catch((e: unknown) => setError(String(e)))
  }, [])

  const user = useMemo(() => {
    return loadUserState()
  }, [userTick]) // re-evaluate when toggling favorite/flag

  const questions = useMemo(() => {
    if (!bank) return []
    const q = filters.q.trim().toLowerCase()
    return bank.questions.filter((it) => {
      if (filters.domain !== 'all' && it.domain !== filters.domain) return false
      if (filters.difficulty !== 'all' && it.difficulty !== filters.difficulty) return false
      if (filters.tag !== 'all' && !it.tags.includes(filters.tag)) return false
      if (filters.onlyFavorites && !user.questions[it.id]?.favorite) return false
      if (filters.onlyFlagged && !user.questions[it.id]?.flagged) return false
      if (!q) return true
      const hay = `${it.prompt.en}\n${it.prompt.zh ?? ''}\n${it.keyPoints
        .map((k) => `${k.en}\n${k.zh ?? ''}`)
        .join('\n')}`.toLowerCase()
      return hay.includes(q)
    })
  }, [bank, filters, user])

  const domains = useMemo(() => {
    if (!bank) return []
    const set = new Set<Domain>()
    bank.questions.forEach((q) => set.add(q.domain))
    return Array.from(set)
  }, [bank])

  const tags = useMemo(() => {
    if (!bank) return []
    const set = new Set<Tag>()
    bank.questions.forEach((q) => q.tags.forEach((t) => set.add(t)))
    return Array.from(set)
  }, [bank])

  function toggleFavorite(question: Question) {
    updateQuestionState(question.id, (prev) => ({ ...prev, favorite: !prev?.favorite }))
    setUserTick((n) => n + 1)
  }

  function toggleFlagged(question: Question) {
    updateQuestionState(question.id, (prev) => ({ ...prev, flagged: !prev?.flagged }))
    setUserTick((n) => n + 1)
  }

  if (error) return <div className="card">加载题库失败：{error}</div>
  if (!bank) return <div className="card">正在加载题库…</div>

  return (
    <div className="stack">
      <section className="card">
        <h1 className="h1">Question Bank</h1>
        <div className="filters">
          <input
            className="input"
            value={filters.q}
            onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))}
            placeholder="Search prompt / key points (EN/ZH)…"
          />
          <select
            className="select"
            value={filters.domain}
            onChange={(e) => setFilters((s) => ({ ...s, domain: e.target.value as Filters['domain'] }))}
          >
            <option value="all">All domains</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {DOMAIN_LABEL[d]}
              </option>
            ))}
          </select>
          <select
            className="select"
            value={filters.difficulty}
            onChange={(e) =>
              setFilters((s) => ({
                ...s,
                difficulty: e.target.value === 'all' ? 'all' : (Number(e.target.value) as 1 | 2 | 3),
              }))
            }
          >
            <option value="all">All difficulty</option>
            <option value={1}>Easy</option>
            <option value={2}>Medium</option>
            <option value={3}>Hard</option>
          </select>
          <select
            className="select"
            value={filters.tag}
            onChange={(e) => setFilters((s) => ({ ...s, tag: e.target.value as Filters['tag'] }))}
          >
            <option value="all">All tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {TAG_LABEL[t]}
              </option>
            ))}
          </select>
          <label className="check">
            <input
              type="checkbox"
              checked={filters.onlyFavorites}
              onChange={(e) => setFilters((s) => ({ ...s, onlyFavorites: e.target.checked }))}
            />
            Favorites only
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={filters.onlyFlagged}
              onChange={(e) => setFilters((s) => ({ ...s, onlyFlagged: e.target.checked }))}
            />
            Flagged only
          </label>
        </div>
      </section>

      <section className="card">
        <div className="rowBetween">
          <div className="muted">
            Showing <b>{questions.length}</b> / {bank.questions.length}
          </div>
          <Link className="link" to="/mock">
            Go to Mock Oral →
          </Link>
        </div>
      </section>

      <section className="stack">
        {questions.map((q) => {
          const st = user.questions[q.id]
          return (
            <div key={q.id} className="card">
              <div className="rowBetween">
                <Link to={`/q/${q.id}`} className="titleLink">
                  {q.prompt.en}
                </Link>
                <div className="row">
                  <button className={st?.favorite ? 'chip chipOn' : 'chip'} onClick={() => toggleFavorite(q)}>
                    Favorite
                  </button>
                  <button className={st?.flagged ? 'chip chipOn' : 'chip'} onClick={() => toggleFlagged(q)}>
                    Flag
                  </button>
                </div>
              </div>
              {displayMode === 'bilingual' && q.prompt.zh ? <div className="muted">{q.prompt.zh}</div> : null}
              <div className="pillRow">
                <span className="pill">{DOMAIN_LABEL[q.domain]}</span>
                <span className="pill">{difficultyLabel(q.difficulty)}</span>
                {q.tags.slice(0, 4).map((t) => (
                  <span key={t} className="pill pillSub">
                    {TAG_LABEL[t]}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}

