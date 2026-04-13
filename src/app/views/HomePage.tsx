import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import type { Bank, Question } from '../types'
import { loadBank } from '../bank'
import { DOMAIN_LABEL, difficultyLabel } from '../taxonomy'
import { loadUserState } from '../storage'
import { useDisplayMode } from './useDisplayMode'

export function HomePage() {
  const displayMode = useDisplayMode()
  const [bank, setBank] = useState<Bank | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBank().then(setBank).catch((e: unknown) => setError(String(e)))
  }, [])

  const stats = useMemo(() => {
    if (!bank) return null
    const user = loadUserState()
    const favorites = Object.entries(user.questions).filter(([, s]) => s.favorite).length
    const flagged = Object.entries(user.questions).filter(([, s]) => s.flagged).length
    return {
      total: bank.questions.length,
      favorites,
      flagged,
    }
  }, [bank])

  const featured: Question | null = useMemo(() => {
    if (!bank?.questions.length) return null
    return bank.questions[0]
  }, [bank])

  if (error) return <div className="card">加载题库失败：{error}</div>
  if (!bank) return <div className="card">正在加载题库…</div>

  return (
    <div className="stack">
      <section className="heroCard">
        <h1>DHA Interview Prep & Mock Oral</h1>
        <p className="muted">
          Searchable question bank with tags. Drill mode + mock oral sessions. Your data stays in your browser
          (localStorage).
        </p>
        <div className="row">
          <Link className="btnPrimary" to="/bank">
            Start Drills
          </Link>
          <Link className="btn" to="/mock">
            Start Mock Oral
          </Link>
        </div>
      </section>

      {stats && (
        <section className="grid3">
          <div className="card">
            <div className="metric">{stats.total}</div>
            <div className="muted">Total questions</div>
          </div>
          <div className="card">
            <div className="metric">{stats.favorites}</div>
            <div className="muted">Favorites</div>
          </div>
          <div className="card">
            <div className="metric">{stats.flagged}</div>
            <div className="muted">Flagged</div>
          </div>
        </section>
      )}

      {featured && (
        <section className="card">
          <div className="rowBetween">
            <h2 className="h2">Featured question</h2>
            <Link to={`/q/${featured.id}`} className="link">
              Open
            </Link>
          </div>
          <div className="pillRow">
            <span className="pill">{DOMAIN_LABEL[featured.domain]}</span>
            <span className="pill">{difficultyLabel(featured.difficulty)}</span>
          </div>
          <div className="prompt">{featured.prompt.en}</div>
          {displayMode === 'bilingual' && featured.prompt.zh ? (
            <div className="muted prompt">{featured.prompt.zh}</div>
          ) : null}
        </section>
      )}
    </div>
  )
}

