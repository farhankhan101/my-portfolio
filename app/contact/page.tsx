// app/contact/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Mail,
  MessageCircle,
  MapPin,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Bot,
  ArrowRight,
  Paperclip,
  X
} from 'lucide-react'
import Interactive3DGlobe from '@/components/public/Interactive3DGlobe'
import Interactive3DShape from '@/components/public/Interactive3DShape'
import ReviewBanner from '@/components/public/ReviewBanner'
import Projects3DGrid from '@/components/public/Projects3DGrid'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Embedded mini-chatbot state variables
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    { role: 'assistant', content: "Hi! I'm Farhan's virtual assistant. Ask me about his tech stack, project history, or availability." }
  ])
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatMessages.length > 1) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1]
        resolve(base64String)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = chatInput.trim()
    if (!text || chatLoading) return

    setChatInput('')
    setChatLoading(true)

    const newMessages = [...chatMessages, { role: 'user' as const, content: text }]
    setChatMessages(newMessages)

    // Add assistant placeholder
    setChatMessages(prev => [...prev, { role: 'assistant' as const, content: 'Thinking...' }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: chatMessages }),
      })

      if (!response.ok) throw new Error('Failed to load reply')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let replyText = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          replyText += chunk
          setChatMessages((prev) => {
            const next = [...prev]
            if (next.length > 0) {
              next[next.length - 1] = { role: 'assistant', content: replyText }
            }
            return next
          })
        }
      }
    } catch (err) {
      console.error(err)
      setChatMessages((prev) => {
        const next = [...prev]
        if (next.length > 0) {
          next[next.length - 1] = { role: 'assistant', content: 'Sorry, I hit a network glitch. Please try again.' }
        }
        return next
      })
    } finally {
      setChatLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !subject || !message) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    // Quick client-side check
    if (message.length < 10) {
      setError('Message must be at least 10 characters long.')
      setLoading(false)
      return
    }

    if (attachment && attachment.size > 2 * 1024 * 1024) {
      setError('Attachment size must be under 2MB.')
      setLoading(false)
      return
    }

    try {
      let attachmentName = null
      let attachmentData = null

      if (attachment) {
        attachmentName = attachment.name
        attachmentData = await getBase64(attachment)
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          subject,
          message,
          attachmentName,
          attachmentData
        }),
      })

      if (res.status === 429) {
        setError('Too many contact attempts. Please wait 15 minutes before sending another inquiry.')
      } else if (res.ok) {
        setSuccess('Thank you! Your message has been received, and a verification email was dispatched.')
        setName('')
        setEmail('')
        setPhone('')
        setSubject('')
        setMessage('')
        setAttachment(null)
      } else {
        const errorText = await res.text()
        let errorMessage = 'Failed to submit form. Please check fields.'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch (_) {
          if (res.status === 413) {
            errorMessage = 'Payload too large. The attached file is too big to upload. Please upload a smaller file under 2MB.'
          } else {
            errorMessage = `Server Error (${res.status}): ${errorText.substring(0, 100)}`
          }
        }
        setError(errorMessage)
      }
    } catch (err) {
      console.error('Contact submission error:', err)
      setError('An unexpected error occurred. Please check network and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full pt-32 pb-0 px-6">
      {/* Interactive 3D Grid Wave Background */}
      <div className="absolute inset-0 h-[480px] opacity-75 dark:opacity-50 pointer-events-none z-0">
        <Projects3DGrid />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      </div>

      {/* Background radial glow */}
      <div className="absolute top-24 left-1/3 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10 pb-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> Connect
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Let's build something epic
            </h1>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Have a project in mind, need software architecture advisory, or want to discuss remote contract opportunities? Feel free to reach out.
            </p>
          </div>
          {/* Rotating 3D Interactive Pyramid shape in Header */}
          <div className="relative w-28 h-28 shrink-0 md:block hidden bg-white/10 dark:bg-white/5 backdrop-blur-md border border-slate-300/30 dark:border-slate-700/30 rounded-2xl overflow-hidden shadow-none">
            <Interactive3DShape shape="pyramid" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left panel: Form (7 cols) */}
          <div className="lg:col-span-7 bg-card/25 dark:bg-card/30 backdrop-blur-md p-6 rounded-2xl border border-border/50 shadow-xl h-fit">
            
            {/* Status alerts */}
            {success && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg flex items-start gap-2.5">
                <CheckCircle size={16} className="shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-lg flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-card/25 dark:bg-card/30 backdrop-blur-sm border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-sm font-semibold placeholder:text-muted-foreground/60 transition-all animate-none"
                  />
                </div>
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john@example.com"
                    required
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-card/25 dark:bg-card/30 backdrop-blur-sm border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-sm font-semibold placeholder:text-muted-foreground/60 transition-all animate-none"
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +92 307 9971295"
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-card/25 dark:bg-card/30 backdrop-blur-sm border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-sm font-semibold placeholder:text-muted-foreground/60 transition-all animate-none"
                />
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Consulting Inquiry / Freelance Project"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-card/25 dark:bg-card/30 backdrop-blur-sm border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-sm font-semibold placeholder:text-muted-foreground/60 transition-all animate-none"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell me details about what you want to construct..."
                  required
                  disabled={loading}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-card/25 dark:bg-card/30 backdrop-blur-sm border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-sm font-semibold placeholder:text-muted-foreground/60 transition-all resize-none animate-none"
                />
              </div>

              {/* File Attachment Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Attachment</label>
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 text-sky-600 dark:text-sky-400 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Paperclip size={13} />
                    <span>Attach Document</span>
                  </button>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0]
                        if (file.size > 2 * 1024 * 1024) {
                          setError('Attachment size must be under 2MB.')
                          setAttachment(null)
                        } else {
                          setError(null)
                          setAttachment(file)
                        }
                      }
                    }}
                    className="hidden"
                  />
                </div>

                {attachment && (
                  <div className="flex items-center justify-between p-3 bg-sky-500/5 border border-sky-500/10 rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Paperclip size={14} className="text-sky-600 dark:text-sky-400 shrink-0" />
                      <div className="min-w-0 font-medium">
                        <span className="block text-xs font-bold text-foreground truncate">{attachment.name}</span>
                        <span className="block text-[10px] text-muted-foreground font-semibold mt-0.5">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="p-1 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-sm shadow-xl transition-all cursor-pointer disabled:opacity-55 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                <span>Dispatch Inquiry</span>
              </button>
            </form>
          </div>

          {/* Right panel: Directory Metadata & Quick links (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Contact directories card */}
            <div className="bg-card/25 dark:bg-card/30 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-border/50 h-fit shadow-sm relative overflow-hidden group">
              {/* Spinning interactive 3D Globe in card background */}
              <div className="absolute -right-16 -bottom-16 w-64 h-64 opacity-20 group-hover:opacity-35 pointer-events-none transition-all duration-300 z-0">
                <Interactive3DGlobe />
              </div>

              <h2 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider relative z-10">
                Contact Directories
              </h2>

              <div className="space-y-6 relative z-10">
                {/* Direct Mail */}
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 mt-1 shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Email Directory</span>
                    <a href="mailto:farhan@silquetech.com" className="text-sm font-extrabold text-foreground hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                      farhan@silquetech.com
                    </a>
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 mt-1 shrink-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Professional Networking</span>
                    <a
                      href="https://www.linkedin.com/mynetwork/grow/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-extrabold text-foreground hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                    >
                      linkedin.com/mynetwork/grow
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 mt-1 shrink-0">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Instant Chat</span>
                    <a
                      href="https://wa.me/923079971295"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-extrabold text-foreground hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                    >
                      +92 307 9971295
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 mt-1 shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Office Location</span>
                    <span className="text-sm font-extrabold text-foreground">
                      Karachi, Pakistan (GMT+5)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Standalone Interactive 3D Globe Card */}
            <div className="bg-card/25 dark:bg-card/30 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-border/50 h-[210px] shadow-sm relative overflow-hidden flex flex-col items-center justify-center group">
              <div className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0">
                <Interactive3DGlobe />
              </div>
              <div className="relative z-10 text-center space-y-1.5 mt-auto bg-background/85 dark:bg-background/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-border/40 shadow-md">
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest block">Global Connection Node</span>
                <span className="text-xs font-extrabold text-foreground">Karachi, Pakistan ⇄ Connected Internationally</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews CTA Banner */}
        <ReviewBanner />

        {/* Full-width interactive AI chatbot panel stuck above the footer */}
        <div className="w-full bg-gradient-to-b from-card/25 via-card/30 to-card/45 dark:from-card/30 dark:via-card/35 dark:to-card/50 backdrop-blur-md p-6 sm:p-8 rounded-t-2xl rounded-b-none border border-border/50 border-b-0 shadow-none relative overflow-hidden group mb-0">
          {/* Volumetric mountain-like blurry glow rising from the footer boundary */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[140%] h-44 bg-gradient-to-t from-sky-500/8 via-sky-500/2 to-transparent dark:from-sky-500/20 dark:via-sky-500/5 to-transparent blur-[65px] rounded-t-[100%] pointer-events-none z-0 animate-pulse" />
          {/* Core volumetric glow highlight at the center footer boundary */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[70%] h-24 bg-sky-400/6 dark:bg-sky-400/15 blur-[40px] rounded-t-full pointer-events-none z-0" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-border/40 relative z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sm font-bold text-sky-600 dark:text-sky-400">
                  AI
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Interactive AI Assistant Console</h3>
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  System Agent Active Online
                </span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground max-w-md md:text-right font-medium">
              Ask me about Farhan's coding background, key projects, availability, or how he can assist your business.
            </p>
          </div>

          {/* Chat Messages scroll area - set to a larger viewport for better readability */}
          <div className="h-[180px] overflow-y-auto my-4 pr-2 space-y-4 relative z-10 scrollbar-thin">
            {chatMessages.map((msg, idx) => {
              const isBot = msg.role === 'assistant'
              return (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${isBot ? '' : 'ml-auto flex-row-reverse'}`}>
                  <div className={`w-6 h-6 rounded-full text-[10px] shrink-0 flex items-center justify-center ${isBot ? 'bg-sky-500/15 border border-sky-500/30 text-sky-600 dark:text-sky-400' : 'bg-secondary border border-border text-foreground'}`}>
                    {isBot ? <Bot size={12} /> : 'U'}
                  </div>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed font-semibold ${isBot ? 'bg-sky-500/5 border border-sky-500/10 text-muted-foreground rounded-tl-none' : 'bg-sky-600 text-white rounded-tr-none'}`}>
                    {msg.content}
                  </div>
                </div>
              )
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input form */}
          <form onSubmit={handleChatSubmit} className="flex gap-3 relative z-10 pt-4 border-t border-border/40">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your question for the AI Assistant..."
              disabled={chatLoading}
              className="flex-1 px-4 py-2.5 bg-background/50 border border-border/60 rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 disabled:opacity-50 font-semibold"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="px-5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0 h-10 text-xs font-bold shadow-lg"
            >
              {chatLoading ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
