// components/public/Footer.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageCircle, Mail, MapPin, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Footer() {
  const pathname = usePathname()
  const [currentTime, setCurrentTime] = useState('')

  // Calculate local time for Karachi (GMT+5)
  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Karachi',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }
      setCurrentTime(new Date().toLocaleTimeString(undefined, options))
    }
    updateTime()
    const timer = setInterval(updateTime, 60000)
    return () => clearInterval(timer)
  }, [])

  // Hide public footer in admin console or login screens
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
    return null
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/60 bg-card/50 py-16 px-6 mt-auto relative overflow-hidden">
      {/* Background radial soft light for footer */}
      <div className="absolute bottom-0 right-10 w-72 h-72 bg-sky-500/5 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 relative z-10">
        
        {/* Left branding (5 cols) - centered on mobile */}
        <div className="md:col-span-5 space-y-4 text-center md:text-left flex flex-col items-center md:items-start justify-center md:justify-start">
          <div className="space-y-1">
            <span className="text-base font-extrabold text-foreground tracking-tight block">
              Farhan Ahmed
            </span>
            <p className="text-xs text-muted-foreground font-semibold">
              Full Stack Developer • SaaS & API Specialist
            </p>
          </div>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed font-semibold">
            Delivering clean-architected solutions, modular user interfaces, and robust systems integrations since 2021. Available for remote project collaborations worldwide.
          </p>
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Available for remote contracts</span>
          </div>
        </div>

        {/* Middle Navigation (3 cols) - horizontal row on mobile */}
        <div className="md:col-span-3 space-y-3.5 text-center md:text-left flex flex-col items-center md:items-start">
          <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider border-b border-border/50 pb-2 w-full md:w-fit">
            Navigation
          </h4>
          <div className="flex flex-row md:flex-col justify-center md:justify-start items-center gap-5 md:gap-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider w-full">
            <Link href="/projects" className="hover:text-sky-500 transition-colors">Work</Link>
            <Link href="/experience" className="hover:text-sky-500 transition-colors">Experience</Link>
            <Link href="/contact" className="hover:text-sky-500 transition-colors">Contact</Link>
          </div>
        </div>

        {/* Right Details: Location & Time (4 cols) - centered items on mobile */}
        <div className="md:col-span-4 space-y-4 text-center md:text-left flex flex-col items-center md:items-start">
          <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider border-b border-border/50 pb-2 w-full md:w-fit">
            Local Metadata
          </h4>
          <div className="flex flex-col sm:flex-row flex-wrap md:flex-col justify-center md:justify-start items-center md:items-start gap-3 md:gap-3 text-xs text-muted-foreground font-semibold w-full">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-sky-500 shrink-0" />
              <span>Karachi, Pakistan (GMT+5)</span>
            </div>
            {currentTime && (
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-sky-500 shrink-0" />
                <span>Local Time: {currentTime}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-sky-500 shrink-0" />
              <a href="mailto:farhan@silquetech.com" className="hover:text-sky-500 transition-colors">
                farhan@silquetech.com
              </a>
            </div>
          </div>

          {/* Social Icons row - centered on mobile */}
          <div className="flex gap-2.5 pt-2 justify-center md:justify-start w-full md:w-auto">
            <a
              href="https://github.com/farhankhan101"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-secondary border border-border hover:border-foreground/20 hover:text-foreground rounded-lg text-muted-foreground transition-all flex items-center justify-center shadow-sm"
              title="GitHub"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/mynetwork/grow/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-secondary border border-border hover:border-foreground/20 hover:text-foreground rounded-lg text-muted-foreground transition-all flex items-center justify-center shadow-sm"
              title="LinkedIn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a
              href="https://wa.me/923079971295"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-secondary border border-border hover:border-foreground/20 hover:text-foreground rounded-lg text-muted-foreground transition-all flex items-center justify-center shadow-sm"
              title="WhatsApp"
            >
              <MessageCircle size={15} />
            </a>
          </div>
        </div>
      </div>

      {/* Under copyright bar - perfectly centered text on mobile */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-semibold text-muted-foreground relative z-10 text-center">
        <span className="w-full sm:w-auto text-center sm:text-left">&copy; {currentYear} Farhan Ahmed. All rights reserved.</span>
        <span className="w-full sm:w-auto text-center sm:text-right">Crafted with Next.js & Tailwind CSS v4</span>
      </div>
    </footer>
  )
}
