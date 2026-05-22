// components/public/ChatbotWidget.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import {
  MessageSquare,
  X,
  Bot,
  Send,
  Loader2,
  AlertTriangle
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

const STARTER_SUGGESTIONS = [
  'What is your primary tech stack?',
  'Are you available for freelance projects?',
  'Tell me about your SaaS experience.',
]

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [suggestions, setSuggestions] = useState<string[]>(STARTER_SUGGESTIONS)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load message count from sessionStorage on load
  useEffect(() => {
    const count = sessionStorage.getItem('chatbot_msg_count')
    if (count) {
      setMessageCount(parseInt(count, 10))
    }
  }, [])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const incrementMessageCount = () => {
    const nextCount = messageCount + 1
    setMessageCount(nextCount)
    sessionStorage.setItem('chatbot_msg_count', nextCount.toString())
    return nextCount
  }

  const fetchFollowUps = async (userMsg: string, assistantReply: string) => {
    setSuggestionsLoading(true)
    try {
      const res = await fetch('/api/chat/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, reply: assistantReply }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions)
        }
      }
    } catch (err) {
      console.error('Error fetching follow-up suggestions:', err)
    } finally {
      setSuggestionsLoading(false)
    }
  }

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim()
    if (!text || loading || messageCount >= 20) return

    setInput('')
    setLoading(true)

    // Append user message
    const userMsgId = Date.now().toString()
    const newMessages: Message[] = [
      ...messages,
      { id: userMsgId, role: 'user', content: text },
    ]
    setMessages(newMessages)

    // Increment message count
    incrementMessageCount()

    // Add assistant placeholder
    const assistantMsgId = (Date.now() + 1).toString()
    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, role: 'assistant', content: '', isStreaming: true },
    ])

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch reply')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let chunks = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunkText = decoder.decode(value, { stream: true })
          chunks += chunkText
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: chunks } : msg
            )
          )
        }
      }

      // Mark stream completed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
        )
      )

      // Fetch dynamic follow-up suggestions
      fetchFollowUps(text, chunks)

    } catch (error) {
      console.error('Chat widget error:', error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: 'Sorry, I hit a network glitch. Please try again or fill out the contact form.', isStreaming: false }
            : msg
        )
      )
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(input)
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-4 bg-sky-600 hover:bg-sky-500 text-white rounded-full transition-all duration-300 shadow-2xl flex items-center justify-center cursor-pointer"
          aria-label="Ask Farhan's AI Assistant"
        >
          {/* Pulse outer ring */}
          <span className="absolute -inset-1 rounded-full bg-sky-500/35 group-hover:scale-110 animate-ping opacity-75 duration-1000 pointer-events-none" />
          
          {isOpen ? <X size={22} className="relative" /> : <MessageSquare size={22} className="relative" />}
        </button>
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-45 w-[90vw] sm:w-[380px] h-[500px] rounded-2xl glassmorphism shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-4 border-b border-border/40 bg-card/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">Farhan's AI Assistant</h3>
                <span className="flex items-center gap-1.5 text-[9px] text-green-500 font-bold uppercase tracking-wider mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Active Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="space-y-6 pt-4">
                <div className="text-center space-y-2">
                  <Bot className="mx-auto text-sky-500 animate-bounce" size={32} />
                  <p className="text-xs font-semibold text-muted-foreground">
                    Hi! Ask me anything about Farhan's background, projects, or availability.
                  </p>
                </div>
                
                {/* Starter Suggestions */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                    Suggested Questions
                  </span>
                  <div className="flex flex-col gap-2">
                    {STARTER_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSendMessage(s)}
                        className="w-full text-left p-2.5 bg-secondary/50 hover:bg-secondary border border-border/80 hover:border-border rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.role === 'user'
                return (
                  <div key={msg.id} className={`flex gap-2.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-foreground ${isUser ? 'bg-sky-500/10 border border-sky-500/20' : 'bg-secondary border border-border'}`}>
                      {isUser ? 'U' : <Bot size={12} />}
                    </div>
                    {/* Content */}
                    <div className={`p-2.5 rounded-xl text-xs leading-relaxed ${isUser ? 'bg-sky-600 text-white rounded-tr-none' : 'bg-card text-foreground border border-border rounded-tl-none'}`}>
                      <div className="markdown-prose">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom limit warn / Input bar */}
          <div className="p-3 border-t border-border/40 bg-card/90 space-y-3.5">
            {/* Dynamic follow-up suggestions */}
            {messages.length > 0 && !loading && suggestions.length > 0 && (
              <div className="space-y-1.5 pb-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="block text-[9px] font-extrabold text-muted-foreground/70 uppercase tracking-wider">
                  Suggested Follow-ups
                </span>
                <div className="flex flex-col gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSendMessage(s)}
                      className="w-full text-left px-2.5 py-1.5 bg-secondary/40 hover:bg-sky-500/10 text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400 border border-border/70 hover:border-sky-500/25 rounded-lg text-[10px] font-bold transition-all cursor-pointer truncate"
                      title={s}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messageCount >= 20 ? (
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2 text-[10px] text-amber-600 dark:text-amber-450 leading-normal font-semibold">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <div>
                  <span>Session limit reached (20 messages). Need more details? Please use the </span>
                  <Link href="/contact" onClick={() => setIsOpen(false)} className="underline hover:text-sky-500 font-bold">
                    contact form
                  </Link>
                  <span>.</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-sky-500/50 text-xs disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-lg transition-colors cursor-pointer"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                </button>
              </form>
            )}
          </div>

        </div>
      )}
    </>
  )
}
