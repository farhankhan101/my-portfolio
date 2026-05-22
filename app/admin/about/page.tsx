// app/admin/about/page.tsx
'use client'

import { useState, useEffect } from 'react'
import ImageUploader from '@/components/admin/ImageUploader'
import { Loader2, Save, User, Settings, Sparkles } from 'lucide-react'

const AVAILABLE_FOR_OPTIONS = [
  'Freelance / Contract',
  'Consulting & Architecture',
  'Full-time Remote Roles',
  'Open-Source Collaboration',
]

export default function AdminAbout() {
  const [activeTab, setActiveTab] = useState<'profile' | 'config'>('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // About Profile state
  const [headline, setHeadline] = useState('')
  const [tagline, setTagline] = useState('')
  const [bio, setBio] = useState('')
  const [bioShort, setBioShort] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [location, setLocation] = useState('')
  const [availableFor, setAvailableFor] = useState<string[]>([])

  // Site Configuration state
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [ogImageUrl, setOgImageUrl] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [footerText, setFooterText] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')

  useEffect(() => {
    const fetchConfigs = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/about')
        if (res.ok) {
          const { about, siteConfig } = await res.json()
          if (about) {
            setHeadline(about.headline || '')
            setTagline(about.tagline || '')
            setBio(about.bio || '')
            setBioShort(about.bioShort || '')
            setAvatarUrl(about.avatarUrl || '')
            setResumeUrl(about.resumeUrl || '')
            setLocation(about.location || '')
            setAvailableFor(about.availableFor || [])
          }
          if (siteConfig) {
            setSeoTitle(siteConfig.seoTitle || '')
            setSeoDescription(siteConfig.seoDescription || '')
            setOgImageUrl(siteConfig.ogImageUrl || '')
            setContactEmail(siteConfig.contactEmail || '')
            setFooterText(siteConfig.footerText || '')
            setGithubUrl(siteConfig.socialLinks?.github || '')
            setLinkedinUrl(siteConfig.socialLinks?.linkedin || '')
            setWhatsappUrl(siteConfig.socialLinks?.whatsapp || '')
            setTwitterUrl(siteConfig.socialLinks?.twitter || '')
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchConfigs()
  }, [])

  const toggleAvailability = (opt: string) => {
    if (availableFor.includes(opt)) {
      setAvailableFor(availableFor.filter((item) => item !== opt))
    } else {
      setAvailableFor([...availableFor, opt])
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      aboutData: {
        headline,
        tagline,
        bio,
        bioShort,
        avatarUrl,
        resumeUrl: resumeUrl || null,
        location,
        availableFor,
      },
      siteConfigData: {
        seoTitle,
        seoDescription,
        ogImageUrl: ogImageUrl || null,
        socialLinks: {
          github: githubUrl,
          linkedin: linkedinUrl,
          whatsapp: whatsappUrl,
          twitter: twitterUrl,
        },
        contactEmail,
        footerText,
      },
    }

    try {
      const res = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        alert('Configurations saved successfully!')
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Failed to save configurations.')
      }
    } catch (error) {
      console.error('Error saving configurations:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-sky-500">
        <Loader2 className="animate-spin" size={32} />
        <span className="text-sm font-medium text-muted-foreground mt-2">Loading profile settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile & Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure profile data, SEO search optimization, and link listings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Navigation Tabs (3 cols) */}
        <div className="lg:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left cursor-pointer border ${
              activeTab === 'profile'
                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80 hover:text-foreground'
            }`}
          >
            <User size={16} />
            About Profile
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left cursor-pointer border ${
              activeTab === 'config'
                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80 hover:text-foreground'
            }`}
          >
            <Settings size={16} />
            SEO & Social Links
          </button>
        </div>

        {/* Right Side: Form Content (9 cols) */}
        <div className="lg:col-span-9 bg-card p-8 rounded-xl border border-border shadow-sm">
          <form onSubmit={handleSave} className="space-y-6">
            {activeTab === 'profile' ? (
              // TAB 1: About Profile
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">About Profile</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Headline */}
                  <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Headline</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Senior Full Stack Developer & SaaS Specialist"
                      required
                      className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm"
                    />
                  </div>

                  {/* Tagline */}
                  <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tagline</label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g. Architecting high-scale applications and clean codes."
                      required
                      className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Karachi, Pakistan"
                      required
                      className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm"
                    />
                  </div>

                  {/* Resume URL */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resume URL (Optional)</label>
                    <input
                      type="text"
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="e.g. Cloudinary PDF link or public document URL"
                      className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm"
                    />
                  </div>
                </div>

                {/* Avatar Image */}
                <div className="space-y-1.5">
                  <ImageUploader value={avatarUrl} onChange={setAvatarUrl} label="Avatar / Headshot Image" />
                </div>

                {/* Bio Short */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Short Bio (Chatbot & Card Preview)</label>
                  <textarea
                    value={bioShort}
                    onChange={(e) => setBioShort(e.target.value)}
                    placeholder="Short 2-3 sentence biography used by RAG chatbot and cards."
                    required
                    rows={3}
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm resize-none"
                  />
                </div>

                {/* Bio Detailed */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detailed Bio (About Page)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Full biography text. Supports plain text/markdown paragraphs."
                    required
                    rows={8}
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm resize-none"
                  />
                </div>

                {/* Availability status options */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Availability Status</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {AVAILABLE_FOR_OPTIONS.map((opt) => {
                      const checked = availableFor.includes(opt)
                      return (
                        <label
                          key={opt}
                          onClick={() => toggleAvailability(opt)}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer select-none ${
                            checked
                              ? 'bg-sky-500/5 border-sky-500/30 text-sky-600 dark:text-sky-400'
                              : 'bg-secondary border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'
                          }`}
                        >
                          <input type="checkbox" checked={checked} readOnly className="hidden" />
                          <span>{opt}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              // TAB 2: SEO & SITE CONFIG
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">SEO & Site Configuration</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SEO Title */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">SEO Page Title</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="e.g. Farhan Ahmed | Portfolio"
                      required
                      className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm"
                    />
                  </div>

                  {/* Contact Email */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. farhan@silquetech.com"
                      required
                      className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm"
                    />
                  </div>

                  {/* SEO Description */}
                  <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">SEO Meta Description</label>
                    <textarea
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Enter search-engine descriptive meta bio."
                      required
                      rows={3}
                      className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm resize-none"
                    />
                  </div>

                  {/* Footer Text */}
                  <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Footer Copyright Text</label>
                    <input
                      type="text"
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      placeholder="e.g. © 2026 Farhan Ahmed. All rights reserved."
                      required
                      className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm"
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Social Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* GitHub */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">GitHub</label>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm"
                      />
                    </div>
                    {/* LinkedIn */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">LinkedIn</label>
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm"
                      />
                    </div>
                    {/* WhatsApp */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">WhatsApp Link</label>
                      <input
                        type="url"
                        value={whatsappUrl}
                        onChange={(e) => setWhatsappUrl(e.target.value)}
                        placeholder="https://wa.me/..."
                        className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm"
                      />
                    </div>
                    {/* Twitter */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Twitter (Optional)</label>
                      <input
                        type="url"
                        value={twitterUrl}
                        onChange={(e) => setTwitterUrl(e.target.value)}
                        placeholder="https://twitter.com/..."
                        className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-border">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-555 text-white rounded-lg font-medium text-sm transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Configurations
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
