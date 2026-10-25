import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../lib/api'
import useAsync from '../lib/useAsync'
import usePolling from '../lib/usePolling'
import { notifyUnreadChanged } from '../lib/unread'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import StatusBadge, { TypeBadge } from '../components/StatusBadge'
import { Loading, ErrorState } from '../components/EmptyState'
import { formatDate, formatDateTime } from '../lib/format'
import { LIMITS } from '@shared/constants'

function Guidance({ report, isOwner, otherName }) {
  if (report.status === 'resolved') return null
  if (report.type === 'found' && isOwner) {
    return (
      <div className="guide">
        <strong>Verify before handing over.</strong> Ask {otherName} to describe the item, then
        compare with your private detail
        {report.privateNote ? (
          <>
            : <em>“{report.privateNote}”</em>
          </>
        ) : (
          ' (you didn’t add one — ask for something only the owner would know)'
        )}
        . Once satisfied, agree on a handover spot.
      </div>
    )
  }
  if (report.type === 'found') {
    return (
      <div className="guide">
        <strong>Think this is yours?</strong> Describe the item in detail — colour, brand, contents
        or any marks only the owner would know — so the finder can verify it.
      </div>
    )
  }
  if (isOwner) {
    return (
      <div className="guide">
        <strong>Someone may have found your item.</strong> Ask where and when they found it, then
        agree on a safe handover spot on campus.
      </div>
    )
  }
  return (
    <div className="guide">
      <strong>Found this item?</strong> Tell {otherName} where and when you found it, and ask them to
      describe it to confirm it’s theirs.
    </div>
  )
}

export default function Thread() {
  const { reportId, userId } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottom = useRef(null)
  const { data, error, loading, reload } = useAsync(async () => {
    const res = await api.messages.thread(reportId, userId)
    notifyUnreadChanged()
    return res
  }, [reportId, userId])
  usePolling(() => reload({ silent: true }), 10000)

  const count = data?.messages.length
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' })
  }, [count])

  if (loading && !data) return <Loading />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const { report, otherUser, messages } = data
  const isOwner = report.userId === user.id

  const send = async (e) => {
    e?.preventDefault()
    if (!body.trim() || sending) return
    setSending(true)
    try {
      await api.messages.send({ reportId, toUserId: userId, body })
      setBody('')
      await reload({ silent: true })
    } catch (err) {
      toast(err.fields?.body || err.message, 'error')
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="page__inner page__inner--narrow thread">
      <div className="thread__header card">
        <Link to="/messages" className="btn btn--ghost btn--sm">
          ← Inbox
        </Link>
        <div className="thread__who">
          <div className="avatar">{otherUser.name[0]}</div>
          <div>
            <strong>{otherUser.name}</strong>
            <div className="muted small">{otherUser.email}</div>
          </div>
        </div>
        <Link to={`/reports/${report.id}`} className="thread__report">
          <div className="row">
            <TypeBadge type={report.type} />
            <StatusBadge status={report.status} />
          </div>
          <strong>{report.title}</strong>
          <span className="muted small">
            {report.location} · {formatDate(report.date)}
          </span>
        </Link>
      </div>

      <Guidance report={report} isOwner={isOwner} otherName={otherUser.name} />

      <div className="thread__messages card">
        {messages.length === 0 && (
          <div className="muted thread__empty">No messages yet. Say hello 👋</div>
        )}
        {messages.map((m) =>
          m.system ? (
            <div key={m.id} className="bubble bubble--system">
              {m.body}
              <div className="bubble__time">{formatDateTime(m.createdAt)}</div>
            </div>
          ) : (
            <div key={m.id} className={`bubble ${m.fromUserId === user.id ? 'bubble--me' : 'bubble--them'}`}>
              {m.body}
              <div className="bubble__time">{formatDateTime(m.createdAt)}</div>
            </div>
          )
        )}
        <div ref={bottom} />
      </div>

      <form className="composer card" onSubmit={send}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`Message ${otherUser.name}… (Enter to send, Shift+Enter for new line)`}
          maxLength={LIMITS.messageMax}
          rows={2}
          autoFocus
        />
        <button className="btn btn--primary" disabled={!body.trim() || sending}>
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  )
}
