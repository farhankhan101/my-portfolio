// app/admin/reviews/page.tsx
'use client'

import { useState, useEffect } from 'react'
import DataTable, { Column } from '@/components/admin/DataTable'
import { Star, Check, X, Trash2, ShieldCheck, ShieldAlert, Award, Loader2 } from 'lucide-react'

interface Review {
  id: string
  name: string
  email: string
  rating: number
  comment: string
  isApproved: boolean
  createdAt: string
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING')
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null)

  // Add Review Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [addName, setAddName] = useState('')
  const [addEmail, setAddEmail] = useState('')
  const [addRating, setAddRating] = useState(5)
  const [addComment, setAddComment] = useState('')
  const [addIsApproved, setAddIsApproved] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/reviews')
      if (res.ok) {
        const data = await res.json()
        setReviews(data)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleApproveToggle = async (id: string, currentApprovalStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !currentApprovalStatus }),
      })
      if (res.ok) {
        setReviews((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isApproved: !currentApprovalStatus } : item))
        )
      }
    } catch (error) {
      console.error('Error toggling approval status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review permanently?')) return
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setReviews((prev) => prev.filter((item) => item.id !== id))
        if (expandedReviewId === id) {
          setExpandedReviewId(null)
        }
      }
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  const handleAddReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addName || !addEmail || !addComment) {
      setAddError('All fields are required.')
      return
    }
    if (addComment.length < 10) {
      setAddError('Comment must be at least 10 characters long.')
      return
    }

    setIsSubmitting(true)
    setAddError(null)

    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addName,
          email: addEmail,
          rating: addRating,
          comment: addComment,
          isApproved: addIsApproved,
        }),
      })

      if (res.ok) {
        const newReview = await res.json()
        setReviews((prev) => [newReview, ...prev])
        // Reset form
        setAddName('')
        setAddEmail('')
        setAddRating(5)
        setAddComment('')
        setAddIsApproved(true)
        setShowAddModal(false)
      } else {
        const data = await res.json()
        setAddError(data.error || 'Failed to add review.')
      }
    } catch (error) {
      setAddError('An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate statistics
  const totalReviewsCount = reviews.length
  const pendingCount = reviews.filter((r) => !r.isApproved).length
  const approvedCount = reviews.filter((r) => r.isApproved).length
  
  const approvedRatings = reviews.filter((r) => r.isApproved).map((r) => r.rating)
  const averageRating = approvedRatings.length > 0
    ? (approvedRatings.reduce((sum, r) => sum + r, 0) / approvedRatings.length).toFixed(1)
    : '0.0'

  // Filter reviews based on active tab
  const filteredReviews = reviews.filter((review) => {
    if (activeTab === 'PENDING') return !review.isApproved
    if (activeTab === 'APPROVED') return review.isApproved
    return true
  })

  const columns: Column<Review>[] = [
    {
      key: 'name',
      header: 'Reviewer',
      render: (item) => (
        <div>
          <span className="text-sm font-bold text-foreground block">
            {item.name}
          </span>
          <span className="text-[10px] text-muted-foreground font-semibold block">{item.email}</span>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (item) => (
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={13}
              className={
                i < item.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground/30'
              }
            />
          ))}
          <span className="text-xs font-extrabold text-foreground ml-1.5">{item.rating}</span>
        </div>
      ),
    },
    {
      key: 'comment',
      header: 'Review Comment',
      render: (item) => {
        const isExpanded = expandedReviewId === item.id
        const isLong = item.comment.length > 80
        return (
          <div className="max-w-md">
            <p className={`text-xs text-muted-foreground leading-normal font-semibold ${isExpanded ? '' : 'line-clamp-2'}`}>
              {item.comment}
            </p>
            {isLong && (
              <button
                onClick={() => setExpandedReviewId(isExpanded ? null : item.id)}
                className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline mt-1 font-bold block cursor-pointer"
              >
                {isExpanded ? 'Show less' : 'Read full comment'}
              </button>
            )}
          </div>
        )
      },
    },
    {
      key: 'isApproved',
      header: 'Status',
      render: (item) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${
          item.isApproved
            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
            : 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
        }`}>
          {item.isApproved ? (
            <>
              <ShieldCheck size={10} />
              <span>APPROVED</span>
            </>
          ) : (
            <>
              <ShieldAlert size={10} />
              <span>PENDING</span>
            </>
          )}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (item) => (
        <span className="text-[11px] text-muted-foreground font-medium">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleApproveToggle(item.id, item.isApproved)}
            className={`flex items-center justify-center p-1.5 rounded transition-all cursor-pointer border ${
              item.isApproved
                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 hover:bg-orange-500/20'
                : 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/20'
            }`}
            title={item.isApproved ? 'Unapprove and Hide Review' : 'Approve and Publish Review'}
          >
            {item.isApproved ? <X size={14} /> : <Check size={14} />}
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="flex items-center justify-center p-1.5 bg-secondary hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded border border-border transition-all cursor-pointer"
            title="Delete Review Permanently"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Review Moderation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Approve, reject, and manage testimonials submitted by clients and partners.
          </p>
        </div>
        <button
          onClick={() => {
            setAddError(null)
            setShowAddModal(true)
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-md hover:shadow-sky-500/10"
        >
          <Star size={14} className="fill-white" />
          <span>Add Review</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Reviews */}
        <div className="p-5 bg-card border border-border rounded-xl space-y-3 shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Submissions</span>
          <div>
            <h3 className="text-3xl font-extrabold text-foreground">{totalReviewsCount}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Reviews in database</p>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="p-5 bg-card border border-border rounded-xl space-y-3 shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Pending Approval</span>
          <div>
            <h3 className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">{pendingCount}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Requires moderation</p>
          </div>
        </div>

        {/* Approved Reviews */}
        <div className="p-5 bg-card border border-border rounded-xl space-y-3 shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Published Testimonials</span>
          <div>
            <h3 className="text-3xl font-extrabold text-green-600 dark:text-green-400">{approvedCount}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Visible to public users</p>
          </div>
        </div>

        {/* Average Rating */}
        <div className="p-5 bg-card border border-border rounded-xl space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Average Rating</span>
            <Award size={16} className="text-amber-400 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-3xl font-extrabold text-foreground">{averageRating}</h3>
              <span className="text-sm font-bold text-muted-foreground">/ 5.0</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Based on published reviews</p>
          </div>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex border-b border-border">
        {(['PENDING', 'APPROVED', 'ALL'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer capitalize ${
              activeTab === tab
                ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-extrabold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'PENDING'
              ? `Pending Approval (${pendingCount})`
              : tab === 'APPROVED'
              ? `Approved (${approvedCount})`
              : `All Submissions (${totalReviewsCount})`}
          </button>
        ))}
      </div>

      {/* Datatable Wrapper */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredReviews}
          searchKey="name"
          searchPlaceholder="Search reviews by reviewer name..."
          loading={loading}
          emptyMessage={
            activeTab === 'PENDING'
              ? 'No reviews pending approval.'
              : activeTab === 'APPROVED'
              ? 'No approved reviews yet.'
              : 'No review submissions found.'
          }
        />
      </div>

      {/* Add Review Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Star size={16} className="text-sky-500 fill-sky-500" />
                <span>Add Review (Direct Entry)</span>
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md hover:bg-secondary text-muted-foreground transition-all cursor-pointer border-0"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddReviewSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              {addError && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg">
                  {addError}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Reviewer Name</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-xs font-semibold transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Reviewer Email</label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="e.g. john@example.com"
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-xs font-semibold transition-all"
                />
              </div>

              {/* Rating */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setAddRating(stars)}
                      disabled={isSubmitting}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        size={20}
                        className={
                          stars <= addRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Comment</label>
                <textarea
                  value={addComment}
                  onChange={(e) => setAddComment(e.target.value)}
                  placeholder="Write the review message content..."
                  required
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-xs font-semibold transition-all resize-none"
                />
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addIsApproved"
                  checked={addIsApproved}
                  onChange={(e) => setAddIsApproved(e.target.checked)}
                  disabled={isSubmitting}
                  className="rounded border-border text-sky-600 focus:ring-sky-500 h-4 w-4"
                />
                <label htmlFor="addIsApproved" className="text-xs font-bold text-foreground cursor-pointer select-none">
                  Approve and publish review immediately
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin animate-duration-1000" size={13} />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Review</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
