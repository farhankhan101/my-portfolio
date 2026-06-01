// components/public/HomepageReviews.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Star, MessageSquare, ShieldCheck, ArrowRight, Award, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Interactive3DShape from '@/components/public/Interactive3DShape'
import { renderFormattedComment, truncateComment } from '@/lib/format'

interface Review {
  id: string
  name: string
  rating: number
  comment: string
  createdAt: any
  designation?: string | null
  company?: string | null
}

interface HomepageReviewsProps {
  initialReviews: Review[]
}

const getShapeForIndex = (index: number) => {
  const shapes: ('cube' | 'pyramid' | 'torus' | 'cylinder' | 'sphere' | 'network')[] = [
    'sphere',
    'torus',
    'pyramid',
    'cylinder',
    'cube',
    'network'
  ]
  return shapes[index % shapes.length]
}

export default function HomepageReviews({ initialReviews }: HomepageReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 1. Fetch latest verified reviews client-side to bypass Next.js static prerender cache
  useEffect(() => {
    const loadLatestReviews = async () => {
      try {
        const res = await fetch('/api/reviews', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            setReviews(data)
          }
        }
      } catch (err) {
        console.error('Failed to update reviews client-side:', err)
      }
    }
    loadLatestReviews()
  }, [])

  // 2. Handle screen resizing to adjust 3D layout scale responsive offsets
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 3. Autoplay rotation logic
  useEffect(() => {
    if (reviews.length <= 1 || isHovered) {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current)
      return
    }

    autoplayTimerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length)
    }, 5000) // cycle every 5 seconds

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current)
    }
  }, [reviews, isHovered])

  const reviewsCount = reviews.length

  const avgRating = reviewsCount > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1)
    : '0.0'

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % reviews.length)
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  const getCardStyle = (index: number) => {
    if (reviews.length === 0) return {}

    // Calculate relative circular index
    const diff = (index - activeIndex + reviews.length) % reviews.length

    let x = 0
    let scale = 1
    let zIndex = 30
    let opacity = 1
    let rotate = 0
    let pointerEvents: 'auto' | 'none' = 'auto'

    const offset = isMobile ? 40 : 220

    if (diff === 0) {
      // Center active card
      x = 0
      scale = 1
      zIndex = 30
      opacity = 1
      rotate = 0
      pointerEvents = 'auto'
    } else if (diff === 1) {
      // Right card stacked behind
      x = offset
      scale = 0.88
      zIndex = 20
      opacity = 0.45
      rotate = 4
      pointerEvents = 'auto'
    } else if (diff === reviews.length - 1) {
      // Left card stacked behind
      x = -offset
      scale = 0.88
      zIndex = 10
      opacity = 0.45
      rotate = -4
      pointerEvents = 'auto'
    } else {
      // Hidden cards
      x = 0
      scale = 0.6
      zIndex = 0
      opacity = 0
      rotate = 0
      pointerEvents = 'none'
    }

    return { x, scale, zIndex, opacity, rotate, pointerEvents }
  }

  return (
    <div className="max-w-5xl mx-auto pt-16 pb-12 border-t border-border/40">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-3">
          <span className="flex items-center gap-1.5 text-sky-500 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Award size={14} /> Endorsements
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            What Partners Say
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-xl leading-relaxed">
            Read authentic feedback from clients and developers about my SaaS deliveries, cloud structures, and software collaboration standards.
          </p>
        </div>

        {reviewsCount > 0 && (
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1">
                <span className="text-sm font-extrabold text-foreground">{avgRating}</span>
                <span className="text-muted-foreground text-xs font-semibold">/ 5.0</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold block mt-0.5">
                {reviewsCount} verified {reviewsCount === 1 ? 'review' : 'reviews'}
              </span>
            </div>
            <Link
              href="/reviews"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary border border-border hover:border-sky-500/30 text-foreground hover:text-sky-600 dark:hover:text-sky-400 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>

      {reviewsCount === 0 ? (
        /* Empty State */
        <div className="bg-card/25 dark:bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl p-10 text-center space-y-5 relative overflow-hidden group shadow-sm">
          {/* Interactive 3D Canvas */}
          <div className="absolute right-6 top-6 w-24 h-24 opacity-20 group-hover:opacity-45 pointer-events-none transition-all duration-350">
            <Interactive3DShape shape="network" />
          </div>
          
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mx-auto relative z-10">
            <MessageSquare size={18} />
          </div>
          <div className="space-y-2 relative z-10">
            <h3 className="text-sm font-bold text-foreground">No reviews yet. Share your experience!</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto font-semibold">
              If we have worked together on software engineering projects, please take a moment to leave a verified review.
            </p>
          </div>
          <div className="pt-2 relative z-10">
            <Link
              href="/reviews?leave=true"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-lg hover:shadow-sky-500/10 transition-all cursor-pointer"
            >
              <MessageSquare size={14} />
              <span>Leave a Review</span>
            </Link>
          </div>
        </div>
      ) : (
        /* 3D Stacked Card Carousel Wrapper */
        <div 
          className="relative w-full py-10 flex flex-col items-center select-none"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left Arrow (Desktop Only) */}
          {reviews.length > 1 && !isMobile && (
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-card/60 backdrop-blur-md border border-border hover:border-sky-500/50 text-foreground hover:text-sky-500 hover:scale-115 transition-all cursor-pointer shadow-md"
              aria-label="Previous review"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {/* 3D Stack Deck container */}
          <div className="relative w-full max-w-lg md:max-w-xl h-[260px] md:h-[230px] flex items-center justify-center">
            {reviews.map((review, idx) => {
              const style = getCardStyle(idx)
              const isCenter = idx === activeIndex
              
              return (
                <motion.div
                  key={review.id}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    pointerEvents: style.pointerEvents,
                  }}
                  animate={{
                    x: style.x,
                    scale: style.scale,
                    zIndex: style.zIndex,
                    opacity: style.opacity,
                    rotate: style.rotate
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 280,
                    damping: 24
                  }}
                  drag={reviews.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, info) => {
                    if (info.offset.x < -60) {
                      handleNext()
                    } else if (info.offset.x > 60) {
                      handlePrev()
                    }
                  }}
                  onClick={() => {
                    if (!isCenter) {
                      setActiveIndex(idx)
                    }
                  }}
                  className={`p-6 md:p-8 bg-card/30 dark:bg-card/45 backdrop-blur-xl border ${
                    isCenter 
                      ? 'border-sky-500/60 shadow-xl shadow-sky-500/5 dark:shadow-sky-500/3' 
                      : 'border-border/50 shadow-sm cursor-pointer hover:border-border'
                  } rounded-2xl flex flex-col justify-between transition-all relative overflow-hidden group min-h-[220px] md:min-h-[190px]`}
                >
                  {/* Interactive 3D Wireframe Canvas */}
                  <div className="absolute right-3 top-3 w-16 h-16 opacity-10 group-hover:opacity-30 pointer-events-none transition-all duration-300">
                    <Interactive3DShape shape={getShapeForIndex(idx)} hovered={isCenter} />
                  </div>

                  {/* Decorative Quote Mark */}
                  <Quote className="absolute right-6 bottom-6 text-sky-500/5 dark:text-sky-500/3 w-14 h-14 rotate-180 pointer-events-none" />

                  {/* Top line metadata */}
                  <div className="flex items-start justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-xs font-extrabold text-sky-600 dark:text-sky-400">
                        {review.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                          <span>{review.name}</span>
                          <ShieldCheck size={14} className="text-sky-500 dark:text-sky-400 shrink-0" />
                        </h4>
                        {(review.designation || review.company) && (
                          <span className="text-[10px] text-muted-foreground font-semibold block mt-0.5">
                            {review.designation}
                            {review.designation && review.company && ' at '}
                            {review.company}
                          </span>
                        )}
                        <span className="text-[9px] text-muted-foreground/50 block mt-0.5">
                          {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className={
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-muted-foreground/30'
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment Body */}
                  {(() => {
                    const { text: truncatedText, isTruncated } = truncateComment(review.comment, 145);
                    const formatted = renderFormattedComment(truncatedText);
                    return (
                      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-semibold italic pl-3 border-l-2 border-sky-500/40 relative z-10 my-4 flex-1">
                        "{formatted}"
                        {isTruncated && (
                          <Link 
                            href={`/reviews?highlight=${review.id}#review-${review.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="ml-1.5 text-sky-500 dark:text-sky-400 hover:underline font-bold not-italic inline-block text-[11px] select-none"
                          >
                            See more
                          </Link>
                        )}
                      </p>
                    );
                  })()}
                </motion.div>
              )
            })}
          </div>

          {/* Right Arrow (Desktop Only) */}
          {reviews.length > 1 && !isMobile && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-card/60 backdrop-blur-md border border-border hover:border-sky-500/50 text-foreground hover:text-sky-500 hover:scale-115 transition-all cursor-pointer shadow-md"
              aria-label="Next review"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* Navigation Dot Indicators */}
          {reviews.length > 1 && (
            <div className="flex items-center gap-2 mt-6 z-10">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeIndex
                      ? 'w-6 bg-sky-500'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Go to review slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
