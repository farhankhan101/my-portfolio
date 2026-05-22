// components/public/Navbar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Code2, Menu, X, ArrowUpRight, Sun, Moon } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Wait until mounted on client to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Do not display public Navbar in the admin console or login screen
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
    return null
  }

  const navLinks = [
    { name: 'Work', href: '/projects' },
    { name: 'Experience', href: '/experience' },
    { name: 'Contact', href: '/contact' },
  ]

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const renderThemeToggle = () => {
    if (!mounted) {
      return (
        <div className="w-9 h-9 rounded-lg border border-border/40 bg-transparent shrink-0" />
      )
    }

    return (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/40 transition-all flex items-center justify-center cursor-pointer shrink-0"
        aria-label="Toggle visual theme"
      >
        {theme === 'dark' ? (
          <Sun size={16} className="text-amber-500 hover:scale-110 transition-transform duration-200" />
        ) : (
          <Moon size={16} className="text-sky-500 hover:scale-110 transition-transform duration-200" />
        )}
      </button>
    )
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border/40 py-3 shadow-lg'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground group shrink-0">
          <Code2 className="text-sky-500 group-hover:scale-110 transition-transform duration-300" size={22} />
          <span className="tracking-tight hover:text-sky-500 transition-colors">Farhan Ahmed</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold tracking-wide transition-colors ${
                  isActive
                    ? 'text-sky-500 dark:text-sky-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
          <Link
            href="/admin"
            className="flex items-center gap-1 text-xs font-bold text-muted-foreground bg-card border border-border hover:border-foreground/20 hover:text-foreground px-3.5 py-1.5 rounded-lg transition-all shadow-sm"
          >
            Console <ArrowUpRight size={12} />
          </Link>
          {renderThemeToggle()}
        </nav>

        {/* Mobile Nav Actions */}
        <div className="flex items-center gap-3 md:hidden">
          {renderThemeToggle()}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors border border-border/40 rounded-lg"
            aria-label="Toggle Navigation menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-x-0 top-[60px] bg-background/95 backdrop-blur-lg border-b border-border py-6 px-6 flex flex-col gap-4 z-30">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-base font-semibold tracking-wide py-2 ${
                  isActive ? 'text-sky-500' : 'text-muted-foreground'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
          <hr className="border-border my-2" />
          <Link
            href="/admin"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between text-sm font-semibold text-muted-foreground hover:text-foreground py-2"
          >
            <span>Admin Console</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      )}
    </header>
  )
}
