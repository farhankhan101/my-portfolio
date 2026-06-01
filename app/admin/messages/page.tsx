// app/admin/messages/page.tsx
'use client'

import { useState, useEffect } from 'react'
import DataTable, { Column } from '@/components/admin/DataTable'
import { Mail, Check, MessageSquare, Trash2, ArrowUpRight, Inbox, Paperclip, Download } from 'lucide-react'

const parseMessage = (rawMessage: string) => {
  // 1. Check for new format with URL
  const newRegex = /\n\[Attachment:\s*([^\]]+)\]\(([^)]+)\)/
  const newMatch = rawMessage.match(newRegex)
  if (newMatch) {
    const name = newMatch[1]
    const url = newMatch[2]
    const cleanMessage = rawMessage.replace(newRegex, '')
    return { cleanMessage, attachment: { name, url, available: true } }
  }

  // 2. Check for legacy format without URL (sent before the uploads update)
  const oldRegex = /\n\[Attached File:\s*([^\]]+)\]/
  const oldMatch = rawMessage.match(oldRegex)
  if (oldMatch) {
    const name = oldMatch[1]
    const cleanMessage = rawMessage.replace(oldRegex, '')
    return { cleanMessage, attachment: { name, url: '', available: false } }
  }
  
  return { cleanMessage: rawMessage, attachment: null }
}

interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'UNREAD' | 'READ' | 'REPLIED' | 'ARCHIVED'
  createdAt: string
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/messages')
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error loading inbox messages:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const handleSelectMessage = async (msg: Message) => {
    setSelectedMessage(msg)
    // If message is UNREAD, update to READ automatically
    if (msg.status === 'UNREAD') {
      try {
        const res = await fetch(`/api/admin/messages/${msg.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'READ' }),
        })
        if (res.ok) {
          // Update local status
          setMessages((prev) =>
            prev.map((item) => (item.id === msg.id ? { ...item, status: 'READ' } : item))
          )
        }
      } catch (error) {
        console.error('Error updating message status:', error)
      }
    }
  }

  const handleUpdateStatus = async (id: string, status: 'READ' | 'REPLIED' | 'ARCHIVED') => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setMessages((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        )
        if (selectedMessage?.id === id) {
          setSelectedMessage((prev) => (prev ? { ...prev, status } : null))
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message permanently?')) return
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchMessages()
        if (selectedMessage?.id === id) {
          setSelectedMessage(null)
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const columns: Column<Message>[] = [
    {
      key: 'name',
      header: 'Sender',
      render: (item) => (
        <div>
          <span className={`text-sm ${item.status === 'UNREAD' ? 'font-extrabold text-foreground' : 'text-muted-foreground'}`}>
            {item.name}
          </span>
          <span className="block text-[10px] text-muted-foreground font-semibold">{item.email}</span>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (item) => (
        <span className={item.status === 'UNREAD' ? 'font-extrabold text-foreground' : 'text-muted-foreground/80'}>
          {item.subject}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
          item.status === 'UNREAD'
            ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 animate-pulse'
            : item.status === 'REPLIED'
            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
            : 'bg-secondary text-muted-foreground border border-border'
        }`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date Received',
      render: (item) => (
        <span className="text-xs text-muted-foreground font-medium">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleSelectMessage(item)}
            className="p-1.5 text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400 hover:bg-secondary rounded transition-colors cursor-pointer text-xs font-semibold"
          >
            Read
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-secondary rounded transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  const { cleanMessage, attachment } = selectedMessage
    ? parseMessage(selectedMessage.message)
    : { cleanMessage: '', attachment: null }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Inbox Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage user contact entries and reply to inquiries.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Table List (7 cols or 12 if no message is selected) */}
        <div className={`${selectedMessage ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all`}>
          <DataTable
            columns={columns}
            data={messages}
            searchKey="name"
            searchPlaceholder="Search messages by sender name..."
            loading={loading}
            emptyMessage="Your inbox is empty."
          />
        </div>

        {/* Right Panel: Selected Message Reader (5 cols) */}
        {selectedMessage && (
          <div className="lg:col-span-5 bg-card p-6 rounded-xl border border-border flex flex-col justify-between h-fit min-h-[360px] shadow-sm">
            <div className="space-y-6">
              {/* Header metadata */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{selectedMessage.name}</h3>
                  <a href={`mailto:${selectedMessage.email}`} className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold block">
                    {selectedMessage.email}
                  </a>
                  <span className="text-[10px] text-muted-foreground/60 block mt-1">
                    Sent {new Date(selectedMessage.createdAt).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Subject */}
              <div className="p-3 bg-secondary/40 border border-border rounded-lg">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Subject</span>
                <span className="text-sm font-bold text-foreground mt-1 block">{selectedMessage.subject}</span>
              </div>

              {/* Message Content */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Message Details</span>
                <p className="text-sm text-foreground bg-secondary/20 border border-border p-4 rounded-xl leading-relaxed whitespace-pre-wrap font-medium break-words">
                  {cleanMessage}
                </p>
              </div>

              {/* Attachment Section */}
              {attachment && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Attachment</span>
                  <div className="flex items-center justify-between p-3.5 bg-secondary/35 border border-border rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Paperclip size={16} className="text-muted-foreground shrink-0" />
                      <div className="min-w-0 font-medium">
                        <span className="block text-xs font-bold text-foreground truncate">{attachment.name}</span>
                      </div>
                    </div>
                    {attachment.available ? (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>View / Download</span>
                        <Download size={12} />
                      </a>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[9px] font-extrabold uppercase tracking-wider rounded">
                        Not Uploaded
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-border mt-6">
              <div className="flex gap-2">
                {selectedMessage.status !== 'REPLIED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'REPLIED')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold border border-green-500/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <Check size={14} /> Mark Replied
                  </button>
                )}
                {selectedMessage.status !== 'ARCHIVED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'ARCHIVED')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold border border-border rounded-lg transition-colors cursor-pointer"
                  >
                    Archive
                  </button>
                )}
              </div>
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                onClick={() => handleUpdateStatus(selectedMessage.id, 'REPLIED')}
                className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Send Email <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
