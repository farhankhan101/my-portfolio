// app/contact/page.tsx
'use client'

import { useState } from 'react'
import {
  Mail,
  MessageCircle,
  MapPin,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Sparkles
} from 'lucide-react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })

      if (res.status === 429) {
        setError('Too many contact attempts. Please wait 15 minutes before sending another inquiry.')
      } else if (res.ok) {
        setSuccess('Thank you! Your message has been received, and a verification email was dispatched.')
        setName('')
        setEmail('')
        setSubject('')
        setMessage('')
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to submit form. Please check fields.')
      }
    } catch (err) {
      console.error('Contact submission error:', err)
      setError('An unexpected error occurred. Please check network and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full py-32 px-6">
      {/* Background radial glow */}
      <div className="absolute top-24 left-1/3 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="space-y-3">
          <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> Connect
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Let's build something epic
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl font-medium leading-relaxed">
            Have a project in mind, need software architecture advisory, or want to discuss remote contract opportunities? Feel free to reach out.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left panel: Form (7 cols) */}
          <div className="lg:col-span-7 bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-xl">
            
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
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-sm font-semibold placeholder:text-muted-foreground/60 transition-all"
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
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-sm font-semibold placeholder:text-muted-foreground/60 transition-all"
                  />
                </div>
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
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-sm font-semibold placeholder:text-muted-foreground/60 transition-all"
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
                  rows={5}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-sm font-semibold placeholder:text-muted-foreground/60 transition-all resize-none"
                />
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
          <div className="lg:col-span-5 space-y-8 bg-card p-6 sm:p-8 rounded-2xl border border-border h-fit shadow-sm">
            <h2 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Contact Directories
            </h2>

            <div className="space-y-6">
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
                    href="https://www.linkedin.com/in/muhammad-farhan-khan-0202b31b6/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-extrabold text-foreground hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  >
                    linkedin.com/in/muhammad-farhan-khan
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
        </div>
      </div>
    </div>
  )
}
