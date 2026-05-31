// components/public/HomepageReviews.tsx
'use client'

import Link from 'next/link'
import { Star, MessageSquare, ShieldCheck, ArrowRight, Award } from 'lucide-react'
import { motion } from 'framer-motion'

interface Review {
  id: string
  name: string
  rating: number
  comment: string
  createdAt: any
}

interface HomepageReviewsProps {
  initialReviews: Review[]
}

export default function HomepageReviews({ initialReviews }: HomepageReviewsProps) {
  const reviewsCount = initialReviews.length

  const avgRating = reviewsCount > 0
    ? (initialReviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1)
    : '0.0'

  return (
    <div className="max-w-5xl mx-auto pt-16 pb-12 border-t border-border/40">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-3">
          <span className="flex items-center gap-1.5 text-sky-500 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Award size={14} /> Endorsements
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            What Partners Say
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-xl leading-relaxed">
            Here's what clients and developers say about my code delivery standards, system architecture designs, and software collaboration.
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
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary border border-border hover:border-sky-500/30 text-foreground hover:text-sky-600 dark:hover:text-sky-400 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>

      {reviewsCount === 0 ? (
        /* Empty State */
        <div className="bg-card/20 border border-border/50 rounded-2xl p-10 text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mx-auto">
            <MessageSquare size={18} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-foreground">No reviews yet. Share your experience!</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto font-semibold">
              If we have worked together on software engineering projects, please take a moment to leave a verified review.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/reviews?write=true"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-sky-655 hover:bg-sky-600 text-white text-xs font-bold rounded-lg shadow-lg hover:shadow-sky-550/10 transition-all cursor-pointer"
            >
              <MessageSquare size={14} />
              <span>Write a Review</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Grid of reviews */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialReviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 bg-card/25 border border-border/60 hover:border-sky-500/30 rounded-2xl shadow-sm flex flex-col justify-between transition-colors space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-xs font-extrabold text-sky-600 dark:text-sky-400">
                    {review.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                      <span>{review.name}</span>
                      <ShieldCheck size={12} className="text-sky-550 shrink-0" />
                    </h4>
                    <span className="text-[9px] text-muted-foreground font-semibold block mt-0.5">
                      {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className={
                        i < review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      }
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-foreground/80 leading-relaxed font-semibold italic pl-1 border-l-2 border-sky-500/20">
                "{review.comment.length > 120 ? `${review.comment.slice(0, 120)}...` : review.comment}"
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
