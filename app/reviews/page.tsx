// app/reviews/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MessageSquare, ShieldCheck, Mail, Send, Award, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import Projects3DGrid from '@/components/public/Projects3DGrid'

interface Review {
  id: string
  name: string
  email: string
  rating: number
  comment: string
  createdAt: string
}

function ReviewsPageContent() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [code, setCode] = useState('')

  // Verification states
  const [codeSent, setCodeSent] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const searchParams = useSearchParams()

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reviews')
      if (res.ok) {
        const data = await res.json()
        setReviews(data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  // Auto-open form if ?write=true is in URL
  useEffect(() => {
    if (searchParams.get('write') === 'true') {
      setShowForm(true)
    }
  }, [searchParams])

  // Request email OTP
  const handleGetCode = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    setSendingCode(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await fetch('/api/reviews/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (res.ok) {
        setCodeSent(true)
        setSuccessMsg('Verification code sent! Check your inbox.')
      } else {
        setErrorMsg(data.error || 'Failed to send code. Please try again.')
      }
    } catch (error) {
      setErrorMsg('Network error. Failed to send verification code.')
    } finally {
      setSendingCode(false)
    }
  }

  // Submit review check
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !comment || !code) {
      setErrorMsg('All fields are required.')
      return
    }

    if (comment.length < 10) {
      setErrorMsg('Comment must be at least 10 characters long.')
      return
    }

    if (code.length !== 6) {
      setErrorMsg('Verification code must be exactly 6 characters.')
      return
    }

    setSubmittingReview(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, rating, comment, code }),
      })

      const data = await res.json()
      if (res.ok) {
        setSuccessMsg(data.message || 'Review submitted successfully!')
        setName('')
        setEmail('')
        setRating(5)
        setComment('')
        setCode('')
        setCodeSent(false)
        setShowForm(false)
        fetchReviews()
      } else {
        setErrorMsg(data.error || 'Failed to submit review. Try again.')
      }
    } catch (error) {
      setErrorMsg('An unexpected error occurred. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Calculate dynamic average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  // Star counts distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
    return { stars, count, percentage }
  })

  return (
    <div className="relative w-full pt-32 pb-24 px-6 overflow-hidden min-h-screen">
      {/* 3D Wave Grid Background */}
      <div className="absolute inset-0 h-[480px] opacity-75 dark:opacity-50 pointer-events-none z-0">
        <Projects3DGrid />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      </div>

      {/* Radial ambient glow */}
      <div className="absolute top-24 left-1/4 w-[480px] h-[480px] bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="flex items-center gap-1.5 text-sky-500 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Award size={14} /> Endorsements
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              Verified Partner Feedback
            </h1>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Read authentic feedback from clients and developers I've partnered with. All reviews are authenticated via email verification.
            </p>
          </div>
          
          <button
            onClick={() => {
              setShowForm(!showForm)
              setErrorMsg(null)
              setSuccessMsg(null)
            }}
            className="px-6 py-3 bg-sky-655 hover:bg-sky-600 text-white text-sm font-bold rounded-lg shadow-xl hover:shadow-sky-550/10 transition-all cursor-pointer shrink-0 animate-pulse hover:animate-none"
          >
            {showForm ? 'Cancel Review' : 'Write Verified Review'}
          </button>
        </div>

        {/* Form Container (Animated Slide-Down) */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card/30 backdrop-blur-md border border-border/60 rounded-2xl p-6 md:p-8 shadow-xl max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-2 text-sky-500">
                  <Sparkles size={18} />
                  <h3 className="text-base font-bold text-foreground">Write a verified recommendation</h3>
                </div>

                {errorMsg && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-lg">
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg">
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sarah Connor"
                        required
                        disabled={submittingReview}
                        className="w-full px-4 py-2.5 bg-background/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-sm font-semibold transition-all"
                      />
                    </div>

                    {/* Email Verification Row */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Email (Private)</label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. sarah@cyberdyne.com"
                          required
                          disabled={codeSent || submittingReview}
                          className="flex-1 min-w-0 px-4 py-2.5 bg-background/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-sm font-semibold transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleGetCode}
                          disabled={!email || codeSent || sendingCode || submittingReview}
                          className="px-4 bg-secondary border border-border hover:border-sky-500/30 hover:text-sky-600 dark:hover:text-sky-400 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer disabled:opacity-40"
                        >
                          {sendingCode ? <Loader2 className="animate-spin" size={14} /> : 'Get Code'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Rating star selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Rating Score</label>
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((stars) => (
                          <button
                            key={stars}
                            type="button"
                            onClick={() => setRating(stars)}
                            disabled={submittingReview}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              size={24}
                              className={
                                stars <= rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-muted-foreground/30'
                              }
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-sm font-extrabold text-foreground ml-1">
                        {rating} out of 5 stars
                      </span>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Review Message</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience working with Farhan Ahmed on SaaS engineering, cloud code development, or product scaling..."
                      required
                      disabled={submittingReview}
                      rows={4}
                      className="w-full px-4 py-2.5 bg-background/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-sm font-semibold transition-all resize-none"
                    />
                  </div>

                  {/* Verification Code Box (Visible only after sending code) */}
                  {codeSent && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1.5 p-4 bg-sky-500/5 border border-sky-500/10 rounded-xl"
                    >
                      <label className="block text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                        Enter 6-Digit Code
                      </label>
                      <div className="flex gap-3 max-w-[280px]">
                        <input
                          type="text"
                          maxLength={6}
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 123456"
                          required
                          disabled={submittingReview}
                          className="w-full text-center tracking-[4px] px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-sm font-bold placeholder:tracking-normal placeholder:text-muted-foreground/60 transition-all"
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-semibold block mt-1.5">
                        Please type the 6-digit OTP code sent to your email. Check your spam folder if not received.
                      </span>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!codeSent || submittingReview}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-sm shadow-xl transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {submittingReview ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    <span>Submit Review for Moderation</span>
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT COLUMN: Stats summary */}
          <div className="lg:col-span-4 bg-card/25 border border-border/50 rounded-2xl p-6 space-y-6">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Review Statistics</h2>

            {/* Avg Rating display */}
            <div className="flex items-center gap-4 border-b border-border/40 pb-6">
              <h3 className="text-5xl font-black text-foreground">{averageRating}</h3>
              <div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={
                        i < Math.round(Number(averageRating))
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      }
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground mt-1 block font-semibold">
                  Based on {reviews.length} approved {reviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>

            {/* Progress Bars breakdown */}
            <div className="space-y-3">
              {ratingDistribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 text-muted-foreground font-semibold flex items-center gap-1 shrink-0">
                    {stars} Star
                  </span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden border border-border/30">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-muted-foreground font-bold shrink-0">
                    {count}
                  </span>
                </div>
              ))}
            </div>

            {/* Authenticity Badge */}
            <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                <ShieldCheck size={16} />
                <h4 className="text-xs font-bold">100% Authentication Guarantee</h4>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal font-semibold">
                To guarantee validation, reviews can only be submitted by developers or employers who verify active ownership of their emails using numeric OTPs.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Reviews Feed */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Client Feedback</h2>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-sky-500" size={32} />
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-card/25 border border-border/50 rounded-2xl p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mx-auto">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">No approved testimonials yet</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-sm mx-auto font-semibold">
                    Be the first verified user to leave a review! Click "Write Verified Review" above to submit yours.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review, idx) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-6 bg-card/25 border border-border/60 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between hover:border-sky-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-xs font-extrabold text-sky-600 dark:text-sky-400">
                          {review.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                            <span>{review.name}</span>
                            <ShieldCheck size={14} className="text-sky-550 shrink-0" title="Verified email owner" />
                          </h4>
                          <span className="text-[10px] text-muted-foreground/60 block mt-0.5">
                            {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i < review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/30'
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-semibold italic pl-1 border-l-2 border-sky-500/30">
                      "{review.comment}"
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PublicReviewsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-sky-500" size={32} />
      </div>
    }>
      <ReviewsPageContent />
    </Suspense>
  )
}
