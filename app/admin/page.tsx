// app/admin/page.tsx
import Link from 'next/link'
import { db } from '@/lib/db'
import {
  FolderGit2,
  MessageSquare,
  Bot,
  Calendar,
  ArrowRight,
  PlusCircle,
  MessageCircle,
  FileText
} from 'lucide-react'

export const revalidate = 0 // always fetch live stats

export default async function AdminDashboard() {
  // Query db statistics
  const [
    totalProjects,
    unreadMessages,
    totalKnowledge,
    recentMessages,
    latestProject,
    latestAbout
  ] = await Promise.all([
    db.project.count(),
    db.contactMessage.count({ where: { status: 'UNREAD' } }),
    db.chatKnowledge.count(),
    db.contactMessage.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    }),
    db.project.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
    db.about.findFirst({ select: { updatedAt: true } })
  ])

  // Determine last content update timestamp
  const dates = [
    latestProject?.updatedAt?.getTime() || 0,
    latestAbout?.updatedAt?.getTime() || 0
  ]
  const lastUpdateRaw = Math.max(...dates)
  const lastUpdateFormatted = lastUpdateRaw > 0 
    ? new Date(lastUpdateRaw).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No updates yet'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome, Farhan</h1>
        <p className="text-sm text-muted-foreground mt-1">Here is a quick overview of your portfolio website CMS.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Projects */}
        <div className="p-6 bg-card border border-border rounded-xl space-y-4 hover:border-sky-500/30 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Projects</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <FolderGit2 size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-foreground">{totalProjects}</h3>
            <p className="text-xs text-muted-foreground mt-1">Work showcases published</p>
          </div>
        </div>

        {/* Unread Messages */}
        <div className="p-6 bg-card border border-border rounded-xl space-y-4 hover:border-sky-500/30 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Messages</span>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <MessageSquare size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-foreground">{unreadMessages}</h3>
            <p className="text-xs text-muted-foreground mt-1">Unread inquiries from forms</p>
          </div>
        </div>

        {/* Chatbot Knowledge Entries */}
        <div className="p-6 bg-card border border-border rounded-xl space-y-4 hover:border-sky-500/30 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vector Chunks</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Bot size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-foreground">{totalKnowledge}</h3>
            <p className="text-xs text-muted-foreground mt-1">Trained knowledge segments</p>
          </div>
        </div>

        {/* Last Content Update */}
        <div className="p-6 bg-card border border-border rounded-xl space-y-4 hover:border-sky-500/30 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Update</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-655 dark:text-teal-400">
              <Calendar size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{lastUpdateFormatted}</h3>
            <p className="text-xs text-muted-foreground mt-2">Dynamic portfolio changes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Messages (8 cols) */}
        <div className="lg:col-span-8 p-6 bg-card border border-border rounded-xl space-y-4 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase text-foreground tracking-wider">Recent Contact Inquiries</h2>
              <Link
                href="/admin/messages"
                className="flex items-center gap-1 text-xs text-sky-650 dark:text-sky-400 hover:underline font-semibold transition-colors"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>

            <div className="divide-y divide-border">
              {recentMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No contact messages received yet.</p>
              ) : (
                recentMessages.map((msg) => (
                  <div key={msg.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{msg.name}</span>
                        <span className="text-[10px] text-muted-foreground">({msg.email})</span>
                      </div>
                      <p className="text-xs font-medium text-sky-600 dark:text-sky-400 mt-0.5">{msg.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">"{msg.message}"</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                        msg.status === 'UNREAD' 
                          ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20' 
                          : msg.status === 'REPLIED'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                          : 'bg-secondary text-muted-foreground border border-border'
                      }`}>
                        {msg.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 font-medium">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions (4 cols) */}
        <div className="lg:col-span-4 p-6 bg-card border border-border rounded-xl space-y-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase text-foreground tracking-wider">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link
              href="/admin/projects"
              className="flex items-center gap-3 p-3 bg-secondary hover:bg-secondary/80 rounded-lg text-foreground text-sm font-semibold border border-border transition-all shadow-sm"
            >
              <PlusCircle size={16} className="text-sky-500 dark:text-sky-400" />
              Add Showcase Project
            </Link>
            <Link
              href="/admin/chatbot"
              className="flex items-center gap-3 p-3 bg-secondary hover:bg-secondary/80 rounded-lg text-foreground text-sm font-semibold border border-border transition-all shadow-sm"
            >
              <Bot size={16} className="text-purple-500 dark:text-purple-400" />
              Train AI Assistant
            </Link>
            <Link
              href="/admin/messages"
              className="flex items-center gap-3 p-3 bg-secondary hover:bg-secondary/80 rounded-lg text-foreground text-sm font-semibold border border-border transition-all shadow-sm"
            >
              <MessageCircle size={16} className="text-orange-500 dark:text-orange-400" />
              Manage Mail Inbox
            </Link>
            <Link
              href="/admin/about"
              className="flex items-center gap-3 p-3 bg-secondary hover:bg-secondary/80 rounded-lg text-foreground text-sm font-semibold border border-border transition-all shadow-sm"
            >
              <FileText size={16} className="text-teal-500 dark:text-teal-400" />
              Edit Profile settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
