// components/public/ReviewBanner.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react'

interface Review {
  rating: number
}

export default function ReviewBanner() {
  const [reviewsCount, setReviewsCount] = useState(0)
  const [avgRating, setAvgRating] = useState('0.0')

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('/api/reviews')
        if (res.ok) {
          const data: Review[] = await res.json()
          setReviewsCount(data.length)
          if (data.length > 0) {
            const sum = data.reduce((acc, r) => acc + r.rating, 0)
            setAvgRating((sum / data.length).toFixed(1))
          }
        }
      } catch (error) {
        console.error('Failed to load review stats for banner:', error)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="w-full relative mt-16 overflow-hidden bg-gradient-to-r from-sky-500/5 via-indigo-500/5 to-cyan-500/5 dark:from-sky-500/10 dark:via-indigo-500/10 dark:to-cyan-500/10 border border-border/60 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Decorative Blur Circle */}
      <div className="absolute -right-16 -top-16 w-36 h-36 bg-sky-500/10 dark:bg-sky-500/20 rounded-full blur-[40px] pointer-events-none" />

      <div className="space-y-3 max-w-xl text-center md:text-left z-10">
        {/* Verification Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/20 dark:border-sky-400/20 text-sky-600 dark:text-sky-455 text-[10px] font-bold uppercase tracking-wider rounded-full">
          <ShieldCheck size={12} className="text-sky-500 dark:text-sky-400" />
          <span>Authentic Partner Reviews</span>
        </div>

        <h3 className="text-lg font-bold text-foreground">
          Interested in my engineering standards?
        </h3>
        
        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
          Read recommendations from companies and developers I've worked with, or leave a verified review if we have collaborated on software projects.
        </p>

        {/* Mini Stats Display */}
        {reviewsCount > 0 && (
          <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={
                    i < Math.round(Number(avgRating))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30'
                  }
                />
              ))}
            </div>
            <span className="text-[11px] text-foreground font-extrabold">{avgRating} out of 5.0</span>
            <span className="text-muted-foreground text-[10px] font-semibold">({reviewsCount} verified {reviewsCount === 1 ? 'review' : 'reviews'})</span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto z-10">
        <Link
          href="/reviews?leave=true"
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-md shadow-sky-500/10 hover:shadow-sky-500/20 text-center"
        >
          <MessageSquare size={13} />
          <span>Leave a Review</span>
        </Link>
        <Link
          href="/reviews"
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
        >
          <span>Read Testimonials</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}
