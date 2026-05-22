// components/admin/ProjectForm.tsx
'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema } from '@/lib/validations'
import { z } from 'zod'
import ImageUploader from './ImageUploader'
import MultiImageUploader from './MultiImageUploader'
import RichTextEditor from './RichTextEditor'
import { Plus, Trash, Loader2, X } from 'lucide-react'

type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectFormProps {
  initialValues?: Partial<ProjectFormValues> & { id?: string }
  onSubmit: (values: ProjectFormValues) => Promise<void>
  onCancel: () => void
}

const CATEGORIES = ['SaaS', 'Web App', 'Chatbot', 'AI Agent', 'Mobile', 'API', 'Other']

export default function ProjectForm({ initialValues, onSubmit, onCancel }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [techInput, setTechInput] = useState('')

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: {
      title: initialValues?.title || '',
      tagline: initialValues?.tagline || '',
      description: initialValues?.description || '',
      coverImage: initialValues?.coverImage || '',
      images: initialValues?.images || [],
      techStack: initialValues?.techStack || [],
      category: initialValues?.category || 'SaaS',
      client: initialValues?.client || '',
      duration: initialValues?.duration || '',
      role: initialValues?.role || '',
      liveUrl: initialValues?.liveUrl || '',
      githubUrl: initialValues?.githubUrl || '',
      featured: initialValues?.featured || false,
      status: initialValues?.status || 'PUBLISHED',
      sortOrder: initialValues?.sortOrder || 0,
      challenge: initialValues?.challenge || '',
      solution: initialValues?.solution || '',
      results: initialValues?.results || '',
      metrics: initialValues?.metrics || [],
    },
  })

  const { fields: metricFields, append: appendMetric, remove: removeMetric } = useFieldArray({
    control,
    name: 'metrics',
  })

  const techStack = watch('techStack')
  const coverImage = watch('coverImage')

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

  const handleFormSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 bg-card p-6 rounded-xl border border-border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Title</label>
          <input
            {...register('title')}
            placeholder="e.g. SilqueRM"
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm transition-colors"
          />
          {errors.title && <p className="text-xs text-red-400 font-medium">{errors.title.message}</p>}
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
          <select
            {...register('category')}
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm transition-colors"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-red-400 font-medium">{errors.category.message}</p>}
        </div>

        {/* Tagline */}
        <div className="col-span-1 md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tagline / Short Card Description</label>
          <input
            {...register('tagline')}
            placeholder="e.g. Multi-tenant Restaurant Management SaaS"
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm transition-colors"
          />
          {errors.tagline && <p className="text-xs text-red-400 font-medium">{errors.tagline.message}</p>}
        </div>

        {/* Cover Image */}
        <div className="col-span-1 md:col-span-2 space-y-1.5">
          <ImageUploader
            value={coverImage}
            onChange={(url) => setValue('coverImage', url, { shouldValidate: true })}
            label="Cover Image"
          />
          {errors.coverImage && <p className="text-xs text-red-400 font-medium">{errors.coverImage.message}</p>}
        </div>

        {/* Gallery Showcase Images */}
        <div className="col-span-1 md:col-span-2 space-y-1.5">
          <MultiImageUploader
            value={watch('images') || []}
            onChange={(urls) => setValue('images', urls, { shouldValidate: true })}
            label="Showcase Images Gallery"
          />
          {errors.images && <p className="text-xs text-red-400 font-medium">{errors.images.message}</p>}
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
                  className="text-muted-foreground/60 hover:text-red-450 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Client */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client Name (Optional)</label>
          <input
            {...register('client')}
            placeholder="e.g. Silquetech"
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm transition-colors"
          />
        </div>

        {/* Duration */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Duration (Optional)</label>
          <input
            {...register('duration')}
            placeholder="e.g. 3 months"
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm transition-colors"
          />
        </div>

        {/* Role */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role (Optional)</label>
          <input
            {...register('role')}
            placeholder="e.g. Lead Full Stack Developer"
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm transition-colors"
          />
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

        {/* Live URL */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Site URL (Optional)</label>
          <input
            {...register('liveUrl')}
            placeholder="https://example.com"
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm transition-colors"
          />
          {errors.liveUrl && <p className="text-xs text-red-400 font-medium">{errors.liveUrl.message}</p>}
        </div>

        {/* Github URL */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">GitHub Repo URL (Optional)</label>
          <input
            {...register('githubUrl')}
            placeholder="https://github.com/..."
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm transition-colors"
          />
          {errors.githubUrl && <p className="text-xs text-red-400 font-medium">{errors.githubUrl.message}</p>}
        </div>

        {/* Featured & Status */}
        <div className="flex items-center gap-6 mt-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              {...register('featured')}
              className="w-4 h-4 rounded border-border bg-secondary text-sky-600 focus:ring-sky-500"
            />
            Featured Project
          </label>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
          <select
            {...register('status')}
            className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm transition-colors"
          >
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Description</label>
        <RichTextEditor
          value={watch('description')}
          onChange={(html) => setValue('description', html, { shouldValidate: true })}
        />
        {errors.description && <p className="text-xs text-red-400 font-medium">{errors.description.message}</p>}
      </div>

      {/* Case Study details */}
      <div className="border-t border-border pt-6 space-y-6">
        <h3 className="text-sm font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Case Study Sections (Optional)</h3>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Challenge</label>
          <RichTextEditor
            value={watch('challenge') || ''}
            onChange={(html) => setValue('challenge', html)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Solution</label>
          <RichTextEditor
            value={watch('solution') || ''}
            onChange={(html) => setValue('solution', html)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Results & Impact</label>
          <RichTextEditor
            value={watch('results') || ''}
            onChange={(html) => setValue('results', html)}
          />
        </div>
      </div>

      {/* Key KPI Metrics */}
      <div className="border-t border-border pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">KPI Metrics</h3>
          <button
            type="button"
            onClick={() => appendMetric({ label: '', value: '' })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-lg text-xs font-semibold cursor-pointer transition-all"
          >
            <Plus size={14} /> Add Metric
          </button>
        </div>

        <div className="space-y-3">
          {metricFields.map((field, idx) => (
            <div key={field.id} className="flex gap-4 items-center">
              <input
                {...register(`metrics.${idx}.label` as const)}
                placeholder="e.g. Uptime"
                className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm"
              />
              <input
                {...register(`metrics.${idx}.value` as const)}
                placeholder="e.g. 99.9%"
                className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm"
              />
              <button
                type="button"
                onClick={() => removeMetric(idx)}
                className="p-2 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
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
          Save Project
        </button>
      </div>
    </form>
  )
}
