import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Bank, MockConfig } from '../types'
import { loadBank } from '../bank'
import { DOMAIN_LABEL, type Domain } from '../taxonomy'
import { uid } from '../utils'
import { upsertMockSession } from '../storage'

export function MockSetupPage() {
  const [bank, setBank] = useState<Bank | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadBank().then(setBank).catch((e: unknown) => setError(String(e)))
  }, [])

  const availableDomains = useMemo(() => {
    if (!bank) return []
    const set = new Set<Domain>()
    bank.questions.forEach((q) => set.add(q.domain))
    return Array.from(set)
  }, [bank])

  const [count, setCount] = useState(8)
  const [showKeyPointsToggle, setShowKeyPointsToggle] = useState(true)
  const [weights, setWeights] = useState<Record<Domain, number>>({
    fundamentals: 1,
    diagnosis: 1,
    treatment: 1,
    safety: 1,
    communication: 1,
    regulation: 1,
  })

  function updateWeight(domain: Domain, next: number) {
    setWeights((s) => ({ ...s, [domain]: Math.max(0, Math.min(10, next)) }))
  }

  function start() {
    const id = uid('mock')
    const domains: Partial<Record<Domain, number>> = {}
    ;(Object.keys(weights) as Domain[]).forEach((d) => {
      if (weights[d] > 0) domains[d] = weights[d]
    })
    const cfg: MockConfig = {
      mode: 'oral',
      domains,
      count: Math.max(1, Math.min(50, count)),
      showKeyPointsToggle,
    }
    upsertMockSession({
      id,
      startedAt: new Date().toISOString(),
      config: cfg,
      questionIds: [],
      idx: 0,
      ratings: {},
      notes: {},
    })
    navigate(`/mock/session/${id}`)
  }

  if (error) return <div className="card">Failed to load bank: {error}</div>
  if (!bank) return <div className="card">Loading question bank…</div>

  return (
    <div className="stack">
      <section className="card">
        <div className="rowBetween">
          <h1 className="h1">Mock Oral</h1>
          <Link to="/bank" className="link">
            Go to bank →
          </Link>
        </div>
        <p className="muted">
          Questions are sampled by domain weights. No time limit by default. Rate yourself and take notes for
          review. Data is stored locally in your browser.
        </p>

        <div className="grid2">
          <label className="field">
            <div className="label">Number of questions</div>
            <input
              className="input"
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </label>
        </div>

        <label className="check">
          <input
            type="checkbox"
            checked={showKeyPointsToggle}
            onChange={(e) => setShowKeyPointsToggle(e.target.checked)}
          />
          Allow showing key points during mock (training mode)
        </label>

        <h2 className="h2">Domain weights (0 = exclude)</h2>
        <div className="stack">
          {availableDomains.map((d) => (
            <div key={d} className="rowBetween">
              <div>
                <div className="title">{DOMAIN_LABEL[d]}</div>
                <div className="muted">Higher weight = higher sampling probability</div>
              </div>
              <input
                className="input inputSmall"
                type="number"
                min={0}
                max={10}
                value={weights[d] ?? 0}
                onChange={(e) => updateWeight(d, Number(e.target.value))}
              />
            </div>
          ))}
        </div>

        <div className="row">
          <button className="btnPrimary" onClick={start}>
            Start
          </button>
          <button className="btn" onClick={() => navigate('/progress')}>
            View progress
          </button>
        </div>
      </section>
    </div>
  )
}

