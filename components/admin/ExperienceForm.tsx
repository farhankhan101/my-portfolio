// components/admin/ExperienceForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { experienceSchema } from '@/lib/validations'
import { z } from 'zod'
import RichTextEditor from './RichTextEditor'
import { Plus, Trash, Loader2, X } from 'lucide-react'

type ExperienceFormValues = z.infer<typeof experienceSchema>

interface ExperienceFormProps {
  initialValues?: Partial<ExperienceFormValues> & { id?: string }
  onSubmit: (values: ExperienceFormValues) => Promise<void>
  onCancel: () => void
}

const JOB_TYPES = ['Full-time', 'Freelance', 'Contract', 'Part-time', 'Internship']

export default function ExperienceForm({ initialValues, onSubmit, onCancel }: ExperienceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [techInput, setTechInput] = useState('')
  const [achievementInput, setAchievementInput] = useState('')
  const [isCurrent, setIsCurrent] = useState(!initialValues?.endDate)

  // Map Date to ISO String YYYY-MM-DD for form date inputs
  const formatDateForInput = (date: any) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema) as any,
    defaultValues: {
      company: initialValues?.company || '',
      companyUrl: initialValues?.companyUrl || '',
      logoUrl: initialValues?.logoUrl || '',
      role: initialValues?.role || '',
      type: initialValues?.type || 'Full-time',
      location: initialValues?.location || '',
      startDate: initialValues?.startDate ? new Date(initialValues.startDate) : new Date(),
      endDate: initialValues?.endDate ? new Date(initialValues.endDate) : null,
      description: initialValues?.description || '',
      achievements: initialValues?.achievements || [],
      techStack: initialValues?.techStack || [],
      sortOrder: initialValues?.sortOrder || 0,
    },
  })

  const techStack = watch('techStack')
  const achievements = watch('achievements')

  useEffect(() => {
    if (isCurrent) {
      setValue('endDate', null, { shouldValidate: true })
    }
  }, [isCurrent, setValue])

  const handleAddTech = () => {
    const trimmed = techInput.trim()
    if (trimmed && !techStack.includes(trimmed)) {
      setValue('techStack', [...techStack, trimmed], { shouldValidate: true })
      setTechInput('')
    }
  }

  const handleRemoveTech = (tech: string) => {
    setValue(
      'techStack',
      techStack.filter((t) => t !== tech),
      { shouldValidate: true }
    )
  }

  const handleAddAchievement = () => {
    const trimmed = achievementInput.trim()
    if (trimmed && !achievements.includes(trimmed)) {
      setValue('achievements', [...achievements, trimmed], { shouldValidate: true })
      setAchievementInput('')
    }
  }

  const handleRemoveAchievement = (idx: number) => {
    setValue(
      'achievements',
      achievements.filter((_, i) => i !== idx),
      { shouldValidate: true }
    )
  }

  const handleFormSubmit = async (data: ExperienceFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Experience submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Name</label>
          <input
            {...register('company')}
            placeholder="e.g. Silquetech"
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm transition-colors"
          />
          {errors.company && <p className="text-xs text-red-400 font-medium">{errors.company.message}</p>}
        </div>

        {/* Company URL */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company URL (Optional)</label>
          <input
            {...register('companyUrl')}
            placeholder="https://silquetech.com"
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm transition-colors"
          />
          {errors.companyUrl && <p className="text-xs text-red-400 font-medium">{errors.companyUrl.message}</p>}
        </div>

        {/* Role */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</label>
          <input
            {...register('role')}
            placeholder="e.g. Senior Full Stack Developer"
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm transition-colors"
          />
          {errors.role && <p className="text-xs text-red-400 font-medium">{errors.role.message}</p>}
        </div>

        {/* Job Type */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Type</label>
          <select
            {...register('type')}
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm transition-colors"
          >
            {JOB_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.type && <p className="text-xs text-red-400 font-medium">{errors.type.message}</p>}
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
          <input
            {...register('location')}
            placeholder="e.g. Karachi, Pakistan"
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm transition-colors"
          />
          {errors.location && <p className="text-xs text-red-400 font-medium">{errors.location.message}</p>}
        </div>

        {/* Sort Order */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sort Order</label>
          <input
            type="number"
            {...register('sortOrder')}
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm transition-colors"
          />
        </div>

        {/* Start Date */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date</label>
          <input
            type="date"
            defaultValue={formatDateForInput(initialValues?.startDate)}
            onChange={(e) => setValue('startDate', new Date(e.target.value), { shouldValidate: true })}
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm"
          />
          {errors.startDate && <p className="text-xs text-red-400 font-medium">{errors.startDate.message}</p>}
        </div>

        {/* End Date */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Date</label>
            <label className="flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isCurrent}
                onChange={(e) => setIsCurrent(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-border bg-secondary text-sky-600 focus:ring-sky-500"
              />
              Currently Work Here
            </label>
          </div>
          <input
            type="date"
            disabled={isCurrent}
            defaultValue={formatDateForInput(initialValues?.endDate)}
            onChange={(e) => setValue('endDate', new Date(e.target.value), { shouldValidate: true })}
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          />
          {errors.endDate && <p className="text-xs text-red-400 font-medium">{errors.endDate.message}</p>}
        </div>

        {/* Tech Stack Input */}
        <div className="col-span-1 md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Technologies Used</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTech()
                }
              }}
              placeholder="Type technology and press Enter or click Add"
              className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm transition-colors"
            />
            <button
              type="button"
              onClick={handleAddTech}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
          {errors.techStack && <p className="text-xs text-red-400 font-medium">{errors.techStack.message}</p>}

          <div className="flex flex-wrap gap-2 mt-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="flex items-center gap-1.5 px-3 py-1 bg-secondary border border-border rounded-full text-xs font-semibold text-muted-foreground"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => handleRemoveTech(tech)}
                  className="text-muted-foreground/60 hover:text-red-455 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Achievements Input */}
        <div className="col-span-1 md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Achievements / Wins</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={achievementInput}
              onChange={(e) => setAchievementInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddAchievement()
                }
              }}
              placeholder="e.g. Built multi-tenant SaaS platform serving 50+ restaurants"
              className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm transition-colors"
            />
            <button
              type="button"
              onClick={handleAddAchievement}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>

          <ul className="space-y-2 mt-2.5">
            {achievements.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start justify-between gap-3 p-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground"
              >
                <span className="leading-relaxed flex-1">• {item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAchievement(idx)}
                  className="text-muted-foreground/65 hover:text-red-500 transition-colors cursor-pointer pt-0.5"
                >
                  <Trash size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detailed Bullet Points Description</label>
        <RichTextEditor
          value={watch('description')}
          onChange={(html) => setValue('description', html, { shouldValidate: true })}
        />
        {errors.description && <p className="text-xs text-red-400 font-medium">{errors.description.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-lg font-medium text-sm transition-colors cursor-pointer border border-border"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSubmitting && <Loader2 className="animate-spin" size={16} />}
          Save Experience
        </button>
      </div>
    </form>
  )
}
