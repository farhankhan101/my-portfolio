// app/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { Code2, Loader2, AlertCircle, Home, Sun, Moon } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    setError(null)

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError('Invalid email or password. Please try again.')
      } else {
        router.push('/admin')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 radial-glow pointer-events-none opacity-40 dark:opacity-100" />

      {/* Login Custom Navbar */}
      <header className="w-full border-b border-border/40 bg-background/50 backdrop-blur-md py-4 px-6 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-base text-foreground group">
            <Code2 className="text-sky-500 group-hover:scale-110 transition-transform duration-300" size={20} />
            <span className="tracking-tight hover:text-sky-500 transition-colors">Farhan Ahmed</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/40 transition-all flex items-center justify-center cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun size={16} className="text-amber-500" />
                ) : (
                  <Moon size={16} className="text-sky-500" />
                )}
              </button>
            )}
            
            {/* Back to Home Button */}
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-xs font-bold border border-border/40 transition-all shadow-sm"
            >
              <Home size={14} />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content (Centered Form) */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 z-10">
        {/* Card wrapper */}
        <div className="w-full max-w-md p-8 bg-card border border-border rounded-2xl shadow-xl backdrop-blur-md">
          {/* Brand header */}
          <div className="text-center space-y-2 mb-8">
            <div className="mx-auto w-12 h-12 bg-sky-500/10 border border-sky-500/20 text-sky-500 rounded-xl flex items-center justify-center">
              <Code2 size={24} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">CMS Console Login</h1>
              <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Farhan Ahmed Portfolio</p>
            </div>
          </div>

          {/* Errors */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farhan@silquetech.com"
                required
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-sky-500/50 text-sm transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-sky-500/50 text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-sky-600 hover:bg-sky-555 text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer shadow-lg disabled:opacity-50"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              <span>Sign In</span>
            </button>
          </form>
          
          {/* Portfolio Access Warning Notice */}
          <div className="mt-8 pt-6 border-t border-border/60 text-center">
            <p className="text-[10px] text-muted-foreground leading-normal font-semibold">
              <strong className="text-foreground font-bold">Farhan Ahmed Portal:</strong> This page is only accessible by Farhan Ahmed to manage his portfolio settings, project showcases, and chatbot training.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
