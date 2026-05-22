// components/admin/ChatTrainer.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  Bot,
  User,
  Send,
  Loader2,
  RefreshCw,
  Edit2,
  Trash2,
  ThumbsUp,
  Plus,
  X,
  Database
} from 'lucide-react'

interface KnowledgeEntry {
  id: string
  type: 'QA' | 'BIO' | 'PROJECT' | 'EXPERIENCE' | 'SKILL' | 'CUSTOM'
  question: string | null
  answer: string
  topic: string | null
  updatedAt: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  queryText?: string // original query in case we correct this message
}

export default function ChatTrainer() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)

  // Knowledge base list
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeEntry[]>([])
  const [isKbLoading, setIsKbLoading] = useState(false)
  const [kbFilter, setKbFilter] = useState<string>('ALL')

  // Edit / Add Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD')
  const [editId, setEditId] = useState<string | null>(null)
  const [formType, setFormType] = useState<'QA' | 'CUSTOM'>('QA')
  const [formQuestion, setFormQuestion] = useState('')
  const [formAnswer, setFormAnswer] = useState('')
  const [formTopic, setFormTopic] = useState('')
  const [refineInstruction, setRefineInstruction] = useState('')
  const [isRefining, setIsRefining] = useState(false)

  // Sync / Re-embed loadings
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Fetch Knowledge base entries
  const fetchKnowledgeBase = async () => {
    setIsKbLoading(true)
    try {
      const res = await fetch('/api/admin/chatbot')
      if (res.ok) {
        const data = await res.json()
        setKnowledgeList(data)
      }
    } catch (error) {
      console.error('Error fetching knowledge:', error)
    } finally {
      setIsKbLoading(false)
    }
  }

  useEffect(() => {
    fetchKnowledgeBase()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 2. Chat Playground - Stream responses
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = inputMessage.trim()
    if (!trimmed || isChatLoading) return

    setInputMessage('')
    setIsChatLoading(true)

    // Add user message
    const userMsgId = Date.now().toString()
    const newMessages: Message[] = [
      ...messages,
      { id: userMsgId, role: 'user', content: trimmed },
    ]
    setMessages(newMessages)

    // Add assistant placeholder message
    const assistantMsgId = (Date.now() + 1).toString()
    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, role: 'assistant', content: '', isStreaming: true, queryText: trimmed },
    ])

    try {
      // Gather chat history (excluding the current user message and placeholder)
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: chatHistory }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch streaming response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let chunks = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const text = decoder.decode(value, { stream: true })
          chunks += text
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: chunks } : msg
            )
          )
        }
      }

      // Mark streaming completed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
        )
      )
    } catch (error) {
      console.error('Chat playground error:', error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: 'Error: Failed to fetch reply from assistant.', isStreaming: false }
            : msg
        )
      )
    } finally {
      setIsChatLoading(false)
    }
  }

  // 3. Edit / Correct Trigger
  const handleOpenCorrect = (query: string, rawAnswer: string) => {
    setModalMode('ADD')
    setEditId(null)
    setFormType('QA')
    setFormQuestion(query)
    setFormAnswer(rawAnswer)
    setFormTopic('chat_correction')
    setRefineInstruction('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (entry: KnowledgeEntry) => {
    setModalMode('EDIT')
    setEditId(entry.id)
    setFormType(entry.type === 'CUSTOM' ? 'CUSTOM' : 'QA')
    setFormQuestion(entry.question || '')
    setFormAnswer(entry.answer)
    setFormTopic(entry.topic || '')
    setRefineInstruction('')
    setIsModalOpen(true)
  }

  const handleOpenAdd = () => {
    setModalMode('ADD')
    setEditId(null)
    setFormType('QA')
    setFormQuestion('')
    setFormAnswer('')
    setFormTopic('')
    setRefineInstruction('')
    setIsModalOpen(true)
  }

  const handleRefineAnswer = async () => {
    if (!formQuestion.trim() || !refineInstruction.trim() || isRefining) return
    setIsRefining(true)
    try {
      const res = await fetch('/api/admin/chatbot/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: formQuestion,
          originalAnswer: formAnswer,
          instruction: refineInstruction,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.refinedAnswer) {
          setFormAnswer(data.refinedAnswer)
          setRefineInstruction('')
        }
      } else {
        alert('Failed to refine answer. Check server configuration.')
      }
    } catch (err) {
      console.error('Refinement error:', err)
      alert('Network error during AI refinement.')
    } finally {
      setIsRefining(false)
    }
  }

  // 4. Save Knowledge entry
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formAnswer.trim()) return

    const payload = {
      type: formType,
      question: formType === 'QA' ? formQuestion : null,
      answer: formAnswer,
      topic: formTopic || null,
    }

    try {
      let res
      if (modalMode === 'ADD') {
        res = await fetch('/api/admin/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`/api/admin/chatbot/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        setIsModalOpen(false)
        fetchKnowledgeBase()
      } else {
        alert('Failed to save knowledge base entry.')
      }
    } catch (error) {
      console.error('Error saving entry:', error)
    }
  }

  // 5. Delete entry
  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge entry?')) return
    try {
      const res = await fetch(`/api/admin/chatbot/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchKnowledgeBase()
      } else {
        alert('Failed to delete entry.')
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  // 6. DB Sync
  const handleSyncFromDB = async () => {
    setIsSyncing(true)
    setSyncStatus('Syncing dynamic tables (About, Projects, Experience, Skills)...')
    try {
      const res = await fetch('/api/admin/embed', {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        setSyncStatus(data.message || 'Synchronization successfully completed!')
        fetchKnowledgeBase()
      } else {
        setSyncStatus('Synchronization failed. Check server logs.')
      }
    } catch (error) {
      console.error('Sync error:', error)
      setSyncStatus('Network error during sync.')
    } finally {
      setIsSyncing(false)
      setTimeout(() => setSyncStatus(null), 5000)
    }
  }

  const filteredKb = knowledgeList.filter((item) => {
    if (kbFilter === 'ALL') return true
    return item.type === kbFilter
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
      {/* LEFT: Sandbox Chat Interface (5 cols) */}
      <div className="lg:col-span-5 flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Sandbox Playground</h2>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Bot training mode</p>
            </div>
          </div>
          <button
            onClick={() => setMessages([])}
            className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
          >
            Clear Sandbox
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
              <Bot size={40} className="text-muted-foreground/40 animate-bounce" />
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Chat Playground is Empty</p>
                <p className="text-xs text-muted-foreground/60 mt-1 max-w-[280px] leading-relaxed">
                  Ask a question to see what your AI Assistant answers using current vectors, and refine answers on the fly!
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user'
              return (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-foreground border ${isUser ? 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400' : 'bg-secondary border-border text-muted-foreground'}`}>
                    {isUser ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  {/* Bubble */}
                  <div className="space-y-1">
                    <div className={`p-3 rounded-xl text-sm leading-relaxed ${isUser ? 'bg-sky-600 text-white rounded-tr-none' : 'bg-secondary/60 text-foreground border border-border rounded-tl-none'}`}>
                      <div className="markdown-prose">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>

                    {/* Actions for chatbot response */}
                    {!isUser && !msg.isStreaming && msg.content && (
                      <div className="flex gap-2.5 px-1 mt-1 text-[11px] font-semibold text-muted-foreground">
                        <button
                          type="button"
                          className="flex items-center gap-1 hover:text-green-500 transition-colors cursor-pointer"
                        >
                          <ThumbsUp size={12} /> Good Answer
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenCorrect(msg.queryText || '', msg.content)}
                          className="flex items-center gap-1 hover:text-sky-500 transition-colors cursor-pointer"
                        >
                          <Edit2 size={12} /> Correct This
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-secondary/20 flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask your assistant anything..."
            className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isChatLoading}
            className="p-2 bg-sky-655 hover:bg-sky-600 disabled:opacity-40 disabled:pointer-events-none text-white rounded-lg transition-colors cursor-pointer"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* RIGHT: Knowledge Base Editor (7 cols) */}
      <div className="lg:col-span-7 flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-border bg-secondary/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-sky-650 dark:text-sky-400" />
            <h2 className="text-sm font-bold text-foreground">Knowledge Base Manager</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSyncFromDB}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} /> Sync DB
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
            >
              <Plus size={12} /> Add QA
            </button>
          </div>
        </div>

        {/* Sync Notification Banner */}
        {syncStatus && (
          <div className="bg-sky-500/10 border-b border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs py-2.5 px-4 font-medium flex items-center gap-2">
            <Loader2 className="animate-spin text-sky-600 dark:text-sky-400 shrink-0" size={14} />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Filters */}
        <div className="px-4 py-3 border-b border-border/50 bg-secondary/10 flex flex-wrap gap-2">
          {['ALL', 'QA', 'BIO', 'PROJECT', 'EXPERIENCE', 'SKILL', 'CUSTOM'].map((filter) => (
            <button
              key={filter}
              onClick={() => setKbFilter(filter)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                kbFilter === filter
                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                  : 'bg-secondary text-muted-foreground border-border/60 hover:bg-secondary/80'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Table List */}
        <div className="flex-1 overflow-y-auto">
          {isKbLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-sky-500">
              <Loader2 className="animate-spin" size={24} />
              <span className="text-xs font-medium text-muted-foreground mt-2">Loading knowledge...</span>
            </div>
          ) : filteredKb.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground font-medium">
              No entries found matching filter.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredKb.map((entry) => (
                <div key={entry.id} className="p-4 hover:bg-secondary/30 flex items-start gap-4 transition-colors">
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Meta row */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                        entry.type === 'QA' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' :
                        entry.type === 'BIO' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20' :
                        entry.type === 'PROJECT' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                        entry.type === 'EXPERIENCE' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-550/10' :
                        entry.type === 'SKILL' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-550/10' :
                        'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-550/10'
                      }`}>
                        {entry.type}
                      </span>
                      {entry.topic && (
                        <span className="text-[10px] text-muted-foreground font-semibold">#{entry.topic}</span>
                      )}
                      <span className="text-[10px] text-muted-foreground/60 ml-auto font-medium">
                        Updated {new Date(entry.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Question (QA) / Preview */}
                    {entry.question && (
                      <h4 className="text-sm font-bold text-foreground">Q: {entry.question}</h4>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {entry.answer}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEdit(entry)}
                      className="p-1.5 text-muted-foreground hover:text-sky-500 hover:bg-secondary rounded transition-colors cursor-pointer"
                      title="Edit Entry"
                    >
                      <Edit2 size={14} />
                    </button>
                    {/* Delete available only for QA and CUSTOM. Auto-sync values should be deleted via DB delete/sync */}
                    {['QA', 'CUSTOM'].includes(entry.type) && (
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-secondary rounded transition-colors cursor-pointer"
                        title="Delete Entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit / Add QA Node Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                {modalMode === 'ADD' ? 'Add QA Knowledge Node' : 'Edit Knowledge Node'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEntry} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-1">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Knowledge Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm"
                  >
                    <option value="QA">Question-Answer</option>
                    <option value="CUSTOM">Custom Free-form</option>
                  </select>
                </div>
                <div className="space-y-1.5 col-span-1">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Topic / Hashtag</label>
                  <input
                    type="text"
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    placeholder="e.g. jepsi-project"
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm"
                  />
                </div>
              </div>

              {/* Question */}
              {formType === 'QA' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Question</label>
                    <input
                      type="text"
                      value={formQuestion}
                      onChange={(e) => setFormQuestion(e.target.value)}
                      placeholder="e.g. What is your experience with Django?"
                      required={formType === 'QA'}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm"
                    />
                  </div>

                  <div className="space-y-2 p-3 rounded-lg bg-secondary/40 border border-border">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                      <Bot size={14} className="animate-pulse" />
                      <span>AI Assistant Refinement Helper</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={refineInstruction}
                        onChange={(e) => setRefineInstruction(e.target.value)}
                        placeholder="e.g. Explain that I built a custom Whatsapp bridge using Baileys"
                        className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-sky-500/30 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleRefineAnswer}
                        disabled={isRefining || !refineInstruction.trim()}
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        {isRefining ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                        <span>Refine Answer</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 leading-normal">
                      Write what Farhan did or some feedback, then click "Refine Answer" to let AI draft the polished text.
                    </p>
                  </div>
                </div>
              )}

              {/* Answer */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {formType === 'QA' ? 'Correct Answer' : 'Custom Knowledge Chunk'}
                </label>
                <textarea
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder="Type the response details you want the AI assistant to search and retrieve..."
                  required
                  rows={6}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-lg font-medium text-xs cursor-pointer border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium text-xs cursor-pointer"
                >
                  Save to Vectors
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
