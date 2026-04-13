import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Bank, Question } from '../types'
import { getQuestionById, loadBank } from '../bank'
import { DOMAIN_LABEL, TAG_LABEL, difficultyLabel } from '../taxonomy'
import { loadUserState, updateQuestionState } from '../storage'
import { nowIso } from '../utils'
import { useDisplayMode } from './useDisplayMode'

export function QuestionPage() {
  const displayMode = useDisplayMode()
  const { id } = useParams()
  const [bank, setBank] = useState<Bank | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showKeyPoints, setShowKeyPoints] = useState(false)
  const [userTick, setUserTick] = useState(0)

  useEffect(() => {
    loadBank().then(setBank).catch((e: unknown) => setError(String(e)))
  }, [])

  const user = useMemo(() => {
    return loadUserState()
  }, [userTick])

  const question: Question | null = useMemo(() => {
    if (!bank || !id) return null
    return getQuestionById(bank, id) ?? null
  }, [bank, id])

  const st = question ? user.questions[question.id] : undefined

  function toggleFavorite() {
    if (!question) return
    updateQuestionState(question.id, (prev) => ({ ...prev, favorite: !prev?.favorite }))
    setUserTick((n) => n + 1)
  }

  function toggleFlagged() {
    if (!question) return
    updateQuestionState(question.id, (prev) => ({ ...prev, flagged: !prev?.flagged }))
    setUserTick((n) => n + 1)
  }

  function saveNote(note: string) {
    if (!question) return
    updateQuestionState(question.id, (prev) => ({ ...prev, note, lastPracticedAt: nowIso() }))
    setUserTick((n) => n + 1)
  }

  if (error) return <div className="card">加载题库失败：{error}</div>
  if (!bank) return <div className="card">正在加载题库…</div>
  if (!question) return <div className="card">未找到题目。</div>

  return (
    <div className="stack">
      <section className="card">
        <div className="rowBetween">
          <Link to="/bank" className="link">
            ← Back to bank
          </Link>
          <div className="row">
            <button className={st?.favorite ? 'chip chipOn' : 'chip'} onClick={toggleFavorite}>
              Favorite
            </button>
            <button className={st?.flagged ? 'chip chipOn' : 'chip'} onClick={toggleFlagged}>
              Flag
            </button>
          </div>
        </div>

        <h1 className="h1">{question.prompt.en}</h1>
        {displayMode === 'bilingual' && question.prompt.zh ? <div className="muted">{question.prompt.zh}</div> : null}

        <div className="pillRow">
          <span className="pill">{DOMAIN_LABEL[question.domain]}</span>
          <span className="pill">{difficultyLabel(question.difficulty)}</span>
          {question.tags.map((t) => (
            <span key={t} className="pill pillSub">
              {TAG_LABEL[t]}
            </span>
          ))}
        </div>

        <div className="rowBetween">
          <label className="check">
            <input
              type="checkbox"
              checked={showKeyPoints}
              onChange={(e) => setShowKeyPoints(e.target.checked)}
            />
            Show key points (EN/ZH)
          </label>
          <div className="muted">
            Source:{' '}
            {question.source.type === 'pdf' ? `${question.source.file} p.${question.source.page}` : 'manual'}
          </div>
        </div>

        {showKeyPoints && (
          <div className="stack">
            <h2 className="h2">Key points</h2>
            <ul className="list">
              {question.keyPoints.map((kp, i) => (
                <li key={i}>
                  <div>{kp.en}</div>
                  {displayMode === 'bilingual' && kp.zh ? <div className="muted">{kp.zh}</div> : null}
                </li>
              ))}
            </ul>
            {question.followUps?.length ? (
              <div className="stack">
                <div className="muted">Follow-ups:</div>
                <div className="rowWrap">
                  {question.followUps.map((fid) => (
                    <Link key={fid} to={`/q/${fid}`} className="pillLink">
                      {fid}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="h2">My notes</h2>
        <textarea
          className="textarea"
          value={st?.note ?? ''}
          onChange={(e) => saveNote(e.target.value)}
          placeholder="Your answer structure, phrasing, follow-ups, pitfalls..."
          rows={6}
        />
        <div className="muted">Notes are saved locally in your browser.</div>
      </section>
    </div>
  )
}

