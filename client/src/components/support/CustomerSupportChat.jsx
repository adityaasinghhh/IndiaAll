import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { sendChatMessage } from '../../services/chatService'

const SUGGESTED = [
  'What commodities does INDIA ALL supply?',
  'I need a quotation for a bulk order.',
  'Can you help with delivery requirements?',
  'How do I contact the sales team?',
]

const WELCOME = "Hello! I am the INDIA ALL support assistant. How can I help you today?"

export default function CustomerSupportChat() {
  const { t } = useLanguage()
  const ct = (key, fallback) =>
    (t.chat && typeof t.chat[key] === 'string' ? t.chat[key] : fallback)

  const panelRef = useRef(null)
  const toggleRef = useRef(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [showSuggested, setShowSuggested] = useState(true)
  const [inputValue, setInputValue] = useState('')

  const [messages, setMessages] = useState([
    { role: 'assistant', content: WELCOME },
  ])

  // Focus management: trap focus in panel, focus close on open, restore on close.
  useEffect(() => {
    if (open) {
      setShowSuggested(true)
      requestAnimationFrame(() => {
        const closeBtn = panelRef.current?.querySelector('[data-support-close]')
        if (closeBtn) closeBtn.focus()
        else inputRef.current?.focus()
      })
    }
    return () => {}
  }, [open])

  useEffect(() => {
    if (open) {
      const handleEsc = (e) => {
        if (e.key === 'Escape') setOpen(false)
      }
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [open])

  const scrollBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })
  }

  useEffect(() => {
    scrollBottom()
  }, [messages, sending])

  const addMessage = (role, content) => {
    setMessages((prev) => [...prev, { role, content }])
    setShowSuggested(false)
  }

  const handleSend = useCallback(
    async (text) => {
      const message = (text || inputValue).trim()
      if (!message) {
        setError(ct('empty', 'Please type a message before sending.'))
        return
      }
      setError(null)
      setInputValue('')
      addMessage('user', message)

      setSending(true)
      try {
        const history = messages.slice(-6)
        const { response } = await sendChatMessage({
          message,
          conversationHistory: history,
        })
        addMessage('assistant', response)
      } catch (err) {
        setError(
          err.message || ct('error', 'Sorry, I could not get a response. Please try again later.')
        )
      } finally {
        setSending(false)
      }
    },
    [inputValue, messages, ct]
  )

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    setError(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggested = (question) => {
    setInputValue(question)
    handleSend(question)
  }

  const openChat = () => {
    setOpen(true)
    setError(null)
  }

  const closeChat = () => {
    setOpen(false)
    setSending(false)
    setError(null)
    toggleRef.current?.focus()
  }

  const minimiseChat = () => {
    setOpen(false)
    setSending(false)
  }

  const enquiryLinkText = ct('enquiryCta', 'Submit an Enquiry')
  const enquiryHint = ct('enquiryHint', 'For a formal quote, use our Enquiry form:')

  return (
    <div className="support-chat-root" role="region" aria-label={ct('title', 'Customer Support')}>
      {/* Floating toggle button (visible only when panel is closed) */}
      {!open && (
        <button
          ref={toggleRef}
          id="support-toggle"
          type="button"
          aria-label={ct('title', 'Customer Support')}
          aria-expanded={open}
          onClick={openChat}
          className="fixed bottom-24 right-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-[#326783] text-white shadow-lg hover:bg-[#255266] focus:outline-none focus:ring-2 focus:ring-[#326783] focus:ring-offset-2 transition-transform hover:scale-105 active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="sr-only">{ct('title', 'Customer Support')}</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          ref={panelRef}
          className="fixed z-[60] bottom-0 left-0 right-0 w-full h-[55vh] flex flex-col md:bottom-24 md:right-6 md:left-auto md:w-96 md:h-[520px] md:rounded-2xl md:border border-[#353B43] bg-[#F3F2EE] text-[#202328] shadow-2xl flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-title"
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#353B43] bg-[#353B43] text-white rounded-t-2xl md:rounded-t-xl">
            <h2 id="support-title" className="text-sm font-semibold leading-snug">
              {ct('title', 'Customer Support')}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-support-minimize
                aria-label={ct('minimize', 'Minimize')}
                onClick={minimiseChat}
                className="flex h-7 w-7 items-center justify-center rounded bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                type="button"
                data-support-close
                aria-label={ct('close', 'Close chat')}
                onClick={closeChat}
                className="flex h-7 w-7 items-center justify-center rounded bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 md:space-y-4" ref={messagesEndRef}>
            {sending && (
              <div className="flex w-fit max-w-[80%] self-start">
                <span className="rounded-md border border-[#D5D7D6] bg-[#D5D7D6] px-3 py-2 text-xs text-[#737D87]">
                  {ct('sending', "Assistant is typing…")}
                </span>
              </div>
            )}
            {messages.map((message, i) => {
              const isUser = message.role === 'user'
              return (
                <div
                  key={i}
                  className={`flex w-fit max-w-[85%] ${isUser ? 'self-end' : 'self-start'}`}
                >
                  <span
                    className={`rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                      isUser
                        ? 'bg-[#326783] text-white rounded-tr-none'
                        : 'bg-white border border-[#D5D7D6] text-[#202328] rounded-tl-none'
                    }`}
                  >
                    {message.content}
                  </span>
                </div>
              )
            })}
            {error && (
              <div className="flex w-full">
                <span className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {error}
                </span>
              </div>
            )}
          </div>

          {showSuggested && !sending && !error && (
            <div className="p-2 border-b border-[#353B43]">
              <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-[#737D87]">
                {ct('suggested', 'Suggested questions')}
              </p>
              <div className="px-4 space-y-2">
                {SUGGESTED.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggested(q)}
                    className="w-full flex items-center justify-between gap-2 rounded border border-[#353B43] bg-white px-3 py-2.5 text-left text-xs text-[#202328] hover:bg-[#F3F2EE] hover:text-[#326783] focus:outline-none focus:ring-2 focus:ring-[#326783] transition-colors"
                  >
                    <span>{q}</span>
                    <svg className="w-3 h-3 text-[#737D87]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 border-t border-[#353B43] bg-[#F3F2EE]">
            {error && (
              <p className="mb-2 px-4 text-xs font-medium text-red-800">{error}</p>
            )}
            <div className="relative">
              <input
                ref={inputRef}
                id="support-input"
                type="text"
                autoComplete="off"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={ct('placeholder', "Type your message…")}
                disabled={sending}
                aria-label={ct('title', 'Customer Support')}
                className="w-full rounded-md border border-[#353B43] bg-white px-4 py-2.5 text-sm text-[#202328] placeholder:text-[#737D87] focus:border-[#326783] focus:outline-none focus:ring-1 focus:ring-[#326783] disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled={sending || !inputValue.trim()}
                onClick={() => handleSend()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-[#326783] text-white px-3 py-2 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#255266] transition-colors"
                aria-label={ct('send', 'Send')}
              >
                {sending ? ct('sending', 'Sending…') : ct('send', 'Send')}
              </button>
            </div>
            <div className="mt-2 pt-2 border-t border-[#D5D7D6]">
              <p className="px-4 mb-2 text-xs text-[#737D87]">{enquiryHint}</p>
              <Link
                to="/enquiry"
                className="px-4 block rounded border border-[#326783] bg-[#326783]/10 py-2 text-sm text-[#326783] font-medium text-center hover:bg-[#326783]/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#326783]"
              >
                {enquiryLinkText}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}