// lib/validations/index.ts
import { z } from 'zod'

export const projectStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])

export const metricSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  value: z.string().min(1, 'Value is required'),
})

export const projectSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  tagline: z.string().min(5, 'Tagline must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  coverImage: z.string().min(1, 'Cover image is required'),
  images: z.array(z.string()).default([]),
  techStack: z.array(z.string()).min(1, 'Select at least one technology'),
  category: z.string().min(1, 'Category is required'),
  client: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  liveUrl: z.string().url('Invalid URL').or(z.literal('')).optional().nullable(),
  githubUrl: z.string().url('Invalid URL').or(z.literal('')).optional().nullable(),
  featured: z.boolean().default(false),
  status: projectStatusSchema.default('PUBLISHED'),
  sortOrder: z.coerce.number().default(0),
  challenge: z.string().optional().nullable(),
  solution: z.string().optional().nullable(),
  results: z.string().optional().nullable(),
  metrics: z.array(metricSchema).optional().nullable(),
})

export const experienceSchema = z.object({
  company: z.string().min(2, 'Company name is required'),
  companyUrl: z.string().url('Invalid URL').or(z.literal('')).optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  role: z.string().min(2, 'Role is required'),
  type: z.string().min(1, 'Job type is required'),
  location: z.string().min(2, 'Location is required'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
  description: z.string().min(10, 'Description bullet points are required'),
  achievements: z.array(z.string()).default([]),
  techStack: z.array(z.string()).min(1, 'Select at least one technology'),
  sortOrder: z.coerce.number().default(0),
})

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  category: z.enum(['Frontend', 'Backend', 'Tools']),
  iconSlug: z.string().min(1, 'Devicons slug is required'),
  proficiency: z.coerce.number().min(0).max(100, 'Proficiency must be between 0 and 100'),
  sortOrder: z.coerce.number().default(0),
})

export const aboutSchema = z.object({
  headline: z.string().min(5, 'Headline must be at least 5 characters'),
  tagline: z.string().min(5, 'Tagline must be at least 5 characters'),
  bio: z.string().min(20, 'Bio must be at least 20 characters'),
  bioShort: z.string().min(10, 'Short bio for chatbot/meta must be at least 10 characters'),
  avatarUrl: z.string().min(1, 'Avatar image is required'),
  resumeUrl: z.string().optional().nullable(),
  availableFor: z.array(z.string()).min(1, 'Select at least one availability status'),
  location: z.string().min(2, 'Location is required'),
})

export const siteConfigSchema = z.object({
  seoTitle: z.string().min(2, 'SEO Title is required'),
  seoDescription: z.string().min(10, 'SEO Description is required'),
  ogImageUrl: z.string().optional().nullable(),
  socialLinks: z.object({
    github: z.string().url('Invalid GitHub URL').or(z.literal('')),
    linkedin: z.string().url('Invalid LinkedIn URL').or(z.literal('')),
    whatsapp: z.string().url('Invalid WhatsApp URL').or(z.literal('')),
    twitter: z.string().url('Invalid Twitter URL').or(z.literal('')).optional(),
  }),
  contactEmail: z.string().email('Invalid contact email'),
  footerText: z.string().min(2, 'Footer text is required'),
})

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().nullable(),
  subject: z.string().min(2, 'Subject must be at least 2 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
  attachmentName: z.string().optional().nullable(),
  attachmentData: z.string().optional().nullable(),
})
