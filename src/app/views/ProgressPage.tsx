import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Bank } from '../types'
import { loadBank } from '../bank'
import { loadUserState } from '../storage'
import { DOMAIN_LABEL } from '../taxonomy'

export function ProgressPage() {
  const [bank, setBank] = useState<Bank | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    loadBank().then(setBank).catch((e: unknown) => setError(String(e)))
  }, [])

  const user = useMemo(() => {
    return loadUserState()
  }, [tick])

  const summary = useMemo(() => {
    if (!bank) return null
    const total = bank.questions.length
    const favorites = Object.values(user.questions).filter((s) => s.favorite).length
    const flagged = Object.values(user.questions).filter((s) => s.flagged).length
    const rated = user.mockSessions
      .flatMap((s) => Object.values(s.ratings))
      .filter((v): v is 1 | 2 | 3 | 4 | 5 => typeof v === 'number').length
    const byDomain: Record<string, number> = {}
    bank.questions.forEach((q) => {
      const st = user.questions[q.id]
      if (st?.favorite || st?.flagged) {
        byDomain[q.domain] = (byDomain[q.domain] ?? 0) + 1
      }
    })
    return { total, favorites, flagged, rated, byDomain }
  }, [bank, user])

  if (error) return <div className="card">Failed to load: {error}</div>
  if (!bank || !summary) return <div className="card">Loading…</div>

  return (
    <div className="stack">
      <section className="card">
        <h1 className="h1">Progress</h1>
        <div className="grid3">
          <div className="card cardInset">
            <div className="metric">{summary.total}</div>
            <div className="muted">Total questions</div>
          </div>
          <div className="card cardInset">
            <div className="metric">{summary.favorites}</div>
            <div className="muted">Favorites</div>
          </div>
          <div className="card cardInset">
            <div className="metric">{summary.flagged}</div>
            <div className="muted">Flagged</div>
          </div>
        </div>
        <div className="muted">Mock ratings recorded: {summary.rated}</div>
        <div className="row">
          <Link className="btnPrimary" to="/mock">
            New mock oral
          </Link>
          <Link className="btn" to="/bank">
            Go to bank
          </Link>
          <button className="btn" onClick={() => setTick((n) => n + 1)}>
            Refresh
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="h2">By domain (favorites/flags)</h2>
        <div className="stack">
          {Object.entries(summary.byDomain)
            .sort((a, b) => b[1] - a[1])
            .map(([domain, n]) => (
              <div key={domain} className="rowBetween">
                <div className="title">{DOMAIN_LABEL[domain as keyof typeof DOMAIN_LABEL] ?? domain}</div>
                <div className="muted">{n}</div>
              </div>
            ))}
          {!Object.keys(summary.byDomain).length && <div className="muted">No favorites or flags yet.</div>}
        </div>
      </section>

      <section className="card">
        <h2 className="h2">Recent sessions (up to 10)</h2>
        <div className="stack">
          {user.mockSessions.slice(0, 10).map((s) => (
            <div key={s.id} className="rowBetween">
              <div>
                <div className="title">{s.id}</div>
                <div className="muted">
                  {new Date(s.startedAt).toLocaleString()} · {s.questionIds.length || s.config.count} questions
                </div>
              </div>
              <Link className="btn" to={`/mock/session/${s.id}`}>
                Open
              </Link>
            </div>
          ))}
          {!user.mockSessions.length && <div className="muted">No sessions yet.</div>}
        </div>
      </section>
    </div>
  )
}

