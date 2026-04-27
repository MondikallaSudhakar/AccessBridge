import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const BASE = 'http://localhost:8081/api'
const BRAND_GREEN = '#5BCB2B'

const formatTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const sortByTimeAsc = (a, b) => new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime()
const sortByTimeDesc = (a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
const mergeById = (current, incoming) => {
  const index = current.findIndex((item) => item.id === incoming.id)
  if (index === -1) {
    return [...current, incoming].sort(sortByTimeAsc)
  }

  const merged = [...current]
  merged[index] = { ...merged[index], ...incoming }
  return merged.sort(sortByTimeAsc)
}

export default function UserMessages() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, loading: authLoading } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ngoById, setNgoById] = useState({})
  const [messagesByNgoId, setMessagesByNgoId] = useState({})
  const [activeNgoId, setActiveNgoId] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [appliedDraftKey, setAppliedDraftKey] = useState('')

  const requestedNgoId = Number(searchParams.get('ngoId') || 0)
  const draftSource = (searchParams.get('source') || '').toLowerCase()
  const draftTitle = searchParams.get('title') || ''
  const draftKey = `${requestedNgoId}|${draftSource}|${draftTitle}`

  const initialDraft = useMemo(() => {
    if (!draftSource) return ''

    if (draftSource === 'requirement') {
      return `Hi, I am interested in your requirement: ${draftTitle}`
    }
    if (draftSource === 'hiring') {
      return `Hi, I am interested in your hiring post: ${draftTitle}`
    }
    if (draftSource === 'service') {
      return `Hi, I am interested in your service: ${draftTitle}`
    }
    return ''
  }, [draftSource, draftTitle])

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user) {
      navigate('/login')
      return
    }
    if (!['USER', 'SPECIAL_ABLED_PERSON', 'GUARDIAN_CAREGIVER'].includes(user.role)) {
      navigate('/dashboard')
      return
    }

    let active = true

    const loadConversations = async () => {
      setLoading(true)
      setError('')

      try {
        const ngos = await api.get('/ngos')
        if (!active) return

        const ngoList = Array.isArray(ngos) ? ngos : []
        const byId = {}
        ngoList.forEach((ngo) => {
          byId[ngo.id] = ngo
        })
        setNgoById(byId)

        const fetches = await Promise.all(
          ngoList.map(async (ngo) => {
            try {
              const messages = await api.get(`/messages/ngo/${ngo.id}`)
              return { ngoId: ngo.id, messages: Array.isArray(messages) ? messages : [] }
            } catch {
              return { ngoId: ngo.id, messages: [] }
            }
          })
        )

        if (!active) return

        const messageMap = {}
        fetches.forEach(({ ngoId, messages }) => {
          if (messages.length > 0) {
            messageMap[ngoId] = [...messages].sort(sortByTimeAsc)
          }
        })

        setMessagesByNgoId(messageMap)

        const threadIds = Object.keys(messageMap)
          .map((id) => Number(id))
          .sort((a, b) => {
            const lastA = messageMap[a]?.[messageMap[a].length - 1]
            const lastB = messageMap[b]?.[messageMap[b].length - 1]
            return sortByTimeDesc(lastA, lastB)
          })

        const hasRequestedNgo = requestedNgoId && byId[requestedNgoId]
        setActiveNgoId(hasRequestedNgo ? requestedNgoId : (threadIds[0] || null))
      } catch (err) {
        if (!active) return
        setError(err?.message || 'Failed to load conversations')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadConversations()

    const token = localStorage.getItem('token')
    if (!token) return () => { active = false }

    const stream = new EventSource(`${BASE}/messages/stream?token=${encodeURIComponent(token)}`)

    stream.addEventListener('message', (event) => {
      if (!active) return

      try {
        const incoming = JSON.parse(event.data)
        const ngoId = Number(incoming.ngoId)
        if (!ngoId) return

        setMessagesByNgoId((prev) => {
          const current = prev[ngoId] || []
          return {
            ...prev,
            [ngoId]: mergeById(current, incoming),
          }
        })

        setActiveNgoId((currentActiveNgoId) => currentActiveNgoId || ngoId)
      } catch {
        // Ignore malformed stream payload
      }
    })

    return () => {
      active = false
      stream.close()
    }
  }, [authLoading, navigate, requestedNgoId, user])

  useEffect(() => {
    if (!requestedNgoId) return
    if (!ngoById[requestedNgoId]) return
    setActiveNgoId(requestedNgoId)
  }, [ngoById, requestedNgoId])

  useEffect(() => {
    if (!requestedNgoId) return
    if (activeNgoId !== requestedNgoId) return
    if (!initialDraft) return
    if (appliedDraftKey === draftKey) return

    setMessageText((current) => (current.trim().length === 0 ? initialDraft : current))
    setAppliedDraftKey(draftKey)
  }, [activeNgoId, appliedDraftKey, draftKey, initialDraft, requestedNgoId])

  const threads = useMemo(() => {
    const baseThreads = Object.entries(messagesByNgoId)
      .map(([ngoId, messages]) => {
        const numericNgoId = Number(ngoId)
        const lastMessage = messages[messages.length - 1]
        const unreadCount = messages.filter(
          (message) =>
            message.senderEmail !== user?.email
            && message.recipientEmail === user?.email
            && !message.seen
        ).length

        return {
          ngoId: numericNgoId,
          ngo: ngoById[numericNgoId],
          lastMessage,
          unreadCount,
        }
      })
      .sort((a, b) => sortByTimeDesc(a.lastMessage, b.lastMessage))

    if (requestedNgoId && ngoById[requestedNgoId] && !baseThreads.some((thread) => thread.ngoId === requestedNgoId)) {
      baseThreads.unshift({
        ngoId: requestedNgoId,
        ngo: ngoById[requestedNgoId],
        lastMessage: null,
      })
    }

    return baseThreads
  }, [messagesByNgoId, ngoById, requestedNgoId])

  const activeMessages = useMemo(() => {
    if (!activeNgoId) return []
    return messagesByNgoId[activeNgoId] || []
  }, [activeNgoId, messagesByNgoId])

  const totalUnread = useMemo(
    () => threads.reduce((sum, thread) => sum + (thread.unreadCount || 0), 0),
    [threads]
  )

  const activeNgo = activeNgoId ? ngoById[activeNgoId] : null

  useEffect(() => {
    if (!activeNgoId) return

    const activeThreadMessages = messagesByNgoId[activeNgoId] || []
    const hasUnread = activeThreadMessages.some(
      (message) =>
        message.senderEmail !== user?.email
        && message.recipientEmail === user?.email
        && !message.seen
    )

    if (!hasUnread) return

    let active = true

    api.put(`/messages/ngo/${activeNgoId}/seen`, {})
      .then((updated) => {
        if (!active || !Array.isArray(updated) || updated.length === 0) return

        setMessagesByNgoId((prev) => {
          const current = prev[activeNgoId] || []
          const merged = updated.reduce((list, message) => mergeById(list, message), current)
          return { ...prev, [activeNgoId]: merged }
        })
      })
      .catch(() => {
        // Best effort: unread badge still updates once SSE seen events arrive.
      })

    return () => {
      active = false
    }
  }, [activeNgoId, messagesByNgoId, user?.email])

  const sendMessage = async (e) => {
    e.preventDefault()

    if (!activeNgoId) {
      setError('Select an NGO conversation first.')
      return
    }

    const content = messageText.trim()
    if (!content) return

    setSending(true)
    setError('')

    try {
      await api.post(`/messages/ngo/${activeNgoId}`, { content })
      setMessageText('')
    } catch (err) {
      setError(err?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (authLoading) {
    return <div className="min-h-screen bg-[#f8fafc] p-10 text-gray-500">Checking your session...</div>
  }

  if (loading) {
    return <div className="min-h-screen bg-[#f8fafc] p-10 text-gray-500">Loading your conversations...</div>
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mx-auto max-w-7xl px-5 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Messages</h1>
            <p className="text-sm text-gray-500">Your NGO conversations in one place{totalUnread > 0 ? ` · ${totalUnread} new` : ''}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700"
          >
            Back to Home
          </button>
        </div>

        {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid h-[78vh] min-h-[560px] grid-cols-1 md:grid-cols-[320px_1fr]">
            <aside className="border-r border-gray-200 bg-[#f8fafc]">
              <div className="border-b border-gray-200 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Conversations</p>
              </div>

              <div className="h-[calc(78vh-49px)] min-h-[511px] overflow-y-auto">
                {threads.length === 0 && (
                  <p className="p-4 text-sm text-gray-500">No messages yet. Open an NGO and send a message to begin.</p>
                )}

                {threads.map((thread) => {
                  const active = thread.ngoId === activeNgoId
                  const name = thread.ngo?.name || 'NGO'
                  const preview = thread.lastMessage?.content || 'No messages'
                  const isMine = thread.lastMessage?.senderEmail === user?.email

                  return (
                    <button
                      key={thread.ngoId}
                      type="button"
                      onClick={() => setActiveNgoId(thread.ngoId)}
                      className={`w-full border-b border-gray-100 px-4 py-3 text-left transition ${active ? 'bg-white' : 'hover:bg-white/70'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-bold text-gray-900">{name}</p>
                        <div className="flex items-center gap-2">
                          {thread.unreadCount > 0 && (
                            <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[11px] font-bold text-[#166534]">
                              {thread.unreadCount}
                            </span>
                          )}
                          <span className="text-[11px] text-gray-500">{formatTime(thread.lastMessage?.createdAt)}</span>
                        </div>
                      </div>
                      <p className="mt-1 truncate text-xs text-gray-500">{isMine ? 'You: ' : ''}{preview}</p>
                    </button>
                  )
                })}
              </div>
            </aside>

            <section className="flex h-full min-h-0 flex-col bg-white">
              {activeNgo ? (
                <>
                  <div className="border-b border-gray-200 bg-gradient-to-r from-[#0f172a] to-[#1e293b] px-5 py-4 text-white">
                    <p className="text-base font-black">{activeNgo.name}</p>
                    <p className="text-xs text-slate-200">{[activeNgo.city, activeNgo.state, activeNgo.country].filter(Boolean).join(', ') || activeNgo.email}</p>
                  </div>

                  <div className="flex-1 min-h-0 space-y-3 overflow-y-auto bg-[#f1f5f9] px-5 py-4">
                    {activeMessages.length === 0 && (
                      <p className="text-sm text-gray-500">No messages in this conversation yet.</p>
                    )}

                    {activeMessages.map((message) => {
                      const mine = message.senderEmail === user?.email
                      return (
                        <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${mine ? 'text-white rounded-br-md' : 'bg-white text-gray-700 border border-gray-200 rounded-bl-md'}`}
                            style={mine ? { backgroundColor: BRAND_GREEN } : {}}
                          >
                            <p className={`text-[11px] font-bold ${mine ? 'text-white/90' : 'text-gray-500'}`}>{mine ? 'You' : message.senderName || 'NGO'}</p>
                            <p className="mt-0.5 whitespace-pre-wrap break-words">{message.content}</p>
                            <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? 'text-white/80' : 'text-gray-400'}`}>
                              <span>{formatTime(message.createdAt)}</span>
                              {mine && <span className={message.seen ? 'text-sky-200' : 'text-white/70'}>{message.seen ? '✓✓' : '✓'}</span>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <form onSubmit={sendMessage} className="border-t border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-2">
                      <input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5BCB2B]"
                      />
                      <button
                        type="submit"
                        disabled={sending}
                        className="rounded-xl px-4 py-2 text-sm font-bold text-white"
                        style={{ backgroundColor: BRAND_GREEN }}
                      >
                        {sending ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-gray-500">
                  Click any conversation to start chatting.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
