// components/admin/Sidebar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard,
  FolderGit2,
  Briefcase,
  Wrench,
  User,
  MessageSquare,
  Bot,
  Code2,
  Image,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Sun,
  Moon,
  Star
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Projects', href: '/admin/projects', icon: FolderGit2 },
  { name: 'Experience', href: '/admin/experience', icon: Briefcase },
  { name: 'Skills', href: '/admin/skills', icon: Wrench },
  { name: 'About & SEO', href: '/admin/about', icon: User },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Chatbot Trainer', href: '/admin/chatbot', icon: Bot },
  { name: 'Media Library', href: '/admin/media', icon: Image },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 bg-secondary text-foreground rounded-md border border-border hover:bg-secondary/80 transition-colors shadow-sm cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="lg:hidden fixed inset-0 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-border/80 bg-card text-foreground flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo / Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-border/40 bg-card">
            <Link href="/admin" className="flex items-center gap-2 font-bold text-lg text-sky-600 dark:text-sky-400">
              <Code2 className="text-sky-500 group-hover:scale-110 transition-transform duration-300" size={22} />
              <span>Farhan Ahmed</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-l-4 border-sky-500'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-sky-600 dark:text-sky-400' : 'text-muted-foreground/80'} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border/40 bg-card space-y-2.5">
          {/* Theme Switcher Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-lg border border-border/40 transition-all cursor-pointer shadow-sm"
              title="Toggle Dark/Light Mode"
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Sun size={14} className="text-amber-500" />
                ) : (
                  <Moon size={14} className="text-sky-600" />
                )}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </span>
              <span className="text-[10px] text-muted-foreground/60 capitalize">{theme}</span>
            </button>
          )}

          {/* View Live Portfolio */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-bold text-muted-foreground bg-secondary hover:bg-secondary/80 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg border border-border/40 transition-all shadow-sm"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} />
              View Live Portfolio
            </span>
          </Link>

          {/* Sign Out */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-lg transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
