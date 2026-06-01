// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  const adminEmail = 'farhan@silquetech.com'
  const adminPassword = 'adminpassword123'

  // 1. Admin user
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Farhan Ahmed',
      password: await bcrypt.hash(adminPassword, 12),
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user created/verified (farhan@silquetech.com / adminpassword123)')

  // 2. About
  const aboutData = {
    headline: 'Full Stack Developer',
    tagline: 'I build scalable web apps that solve real problems.',
    bio: `<p>I'm Farhan Ahmed, a Full Stack Developer at Silquetech, Karachi. I specialize in building robust backend services and interactive frontends. Over the last 5+ years, I have architected and deployed multiple SaaS applications, custom developer tools, and automation systems.</p>`,
    bioShort: 'Full Stack Developer with 5+ years experience in React, Next.js, Django, and PostgreSQL.',
    avatarUrl: '/assets/avatar.jpg',
    location: 'Karachi, Pakistan',
    availableFor: ['Software Engineer', 'Contract', 'Consulting'],
  }

  await prisma.about.upsert({
    where: { id: 'singleton' },
    update: aboutData,
    create: {
      id: 'singleton',
      ...aboutData
    },
  })
  console.log('✅ About section created/verified')

  // Clean old details to avoid duplicate seeding crashes
  await prisma.experience.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.skill.deleteMany({})
  await prisma.chatKnowledge.deleteMany({})

  // 3. Work Experience — add all your real experiences
  await prisma.experience.createMany({
    data: [
      {
        company: 'Silquetech',
        role: 'Full Stack Developer',
        type: 'Full-time',
        location: 'Karachi, Pakistan',
        startDate: new Date('2022-01-01'),
        endDate: null, // current
        description: `<ul><li>Led frontend architecture for SilqueRM restaurant SaaS.</li><li>Optimized query performance for large PostgreSQL datasets.</li><li>Mentored junior team members and introduced CI/CD workflows.</li></ul>`,
        achievements: [
          'Built multi-tenant SaaS platform serving 50+ restaurants',
          'Architected QR-based self-ordering system with Socket.io real-time',
          'Implemented Docker-based tenant provisioning with SSE streaming',
        ],
        techStack: ['React', 'Next.js', 'Django', 'PostgreSQL', 'Docker', 'Socket.io'],
        sortOrder: 1,
      },
      {
        company: 'Flycraft Solutions',
        role: 'Full Stack Developer',
        type: 'Freelance',
        location: 'Karachi, Pakistan (Remote)',
        startDate: new Date('2025-05-01'),
        endDate: null,
        description: `<ul><li>Developed custom full-stack solutions and integrations for clients.</li><li>Built secure, high-performance server architecture and custom APIs for JEPSI (aviation charter & fueling platform).</li></ul>`,
        achievements: [
          'Designed low-latency booking engines and flight plan synchronization integrations',
        ],
        techStack: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Express'],
        sortOrder: 2,
      },
    ],
  })
  console.log('✅ Work experience created')

  // 4. Projects — add JEPSI, SilqueRM, FlexUp, TaxSaathi, Shaadi Bazaar etc.
  await prisma.project.createMany({
    data: [
      {
        slug: 'silquerm',
        title: 'SilqueRM',
        tagline: 'Multi-tenant Restaurant Management SaaS',
        description: `<p>Full-featured restaurant management platform offering advanced reservation tools, real-time table status tracking, automated staff scheduling, and inline QR-based ordering.</p>`,
        coverImage: '/assets/projects/silquerm.jpg',
        techStack: ['React', 'Next.js', 'Django', 'PostgreSQL', 'Docker', 'Socket.io'],
        category: 'SaaS',
        client: 'Silquetech',
        role: 'Lead Full Stack Developer',
        featured: true,
        challenge: `<p>Managing isolated data for multiple restaurant tenants with real-time requirements and minimal database overhead.</p>`,
        solution: `<p>Built multi-tenant architecture with isolated schemas in PostgreSQL and synchronized events via Socket.io channels.</p>`,
        results: `<p>50+ restaurants successfully onboarded, 99.9% uptime maintained over the first year of deployment.</p>`,
        metrics: [
          { label: 'Restaurants', value: '50+' },
          { label: 'Uptime', value: '99.9%' },
          { label: 'Avg Response', value: '< 200ms' },
        ],
        sortOrder: 1,
      },
      {
        slug: 'taxsaathi',
        title: 'TaxSaathi PK',
        tagline: 'FBR Tax Compliance SaaS for Pakistani SMEs',
        description: `<p>Comprehensive tax compliance platform automating tax filing, invoice parsing, and automated reporting to the Federal Board of Revenue (FBR) in Pakistan.</p>`,
        coverImage: '/assets/projects/taxsaathi.jpg',
        techStack: ['Next.js 15', 'Prisma', 'PostgreSQL', 'Playwright', 'Tauri', 'React Native', 'pgvector', 'Gemini'],
        category: 'SaaS',
        role: 'Sole Developer & Architect',
        featured: true,
        challenge: `<p>The official FBR IRIS portal has no public API, making automated filing and synchronization highly complex and error-prone.</p>`,
        solution: `<p>Built a Playwright automation engine with 3 running modes (headless, headed, and native Tauri/React Native containers) for reliable background task processing.</p>`,
        results: `<p>Automated tax filing process reducing the average manual submission time from 4 hours to just 8 minutes.</p>`,
        metrics: [
          { label: 'Time Saved', value: '97%' },
          { label: 'Filing Speed', value: '8 min' },
        ],
        sortOrder: 2,
      },
      {
        slug: 'courier-logistics',
        title: 'Enterprise Courier & Logistics',
        tagline: 'Courier Management & WhatsApp setup',
        description: `<p>A high-performance logistics and shipment tracking platform with integrated WhatsApp notifications and automated receipt generations.</p>`,
        coverImage: '/assets/projects/courier.jpg',
        techStack: ['PHP', 'Laravel', 'MySQL', 'Node.js', 'Socket.io', 'Bootstrap'],
        category: 'Web App',
        role: 'Lead Backend Developer',
        featured: true,
        challenge: `<p>Providing instant real-time WhatsApp status updates to customers and administrators for high-volume daily shipments.</p>`,
        solution: `<p>Built a custom Node.js WhatsApp bridge gateway that queues requests and sends real-time template messages using Baileys.</p>`,
        results: `<p>Automated notifications for over 10,000+ monthly shipments, reducing customer status queries by 45%.</p>`,
        metrics: [
          { label: 'Shipments Handled', value: '10K+/mo' },
          { label: 'Query Reduction', value: '45%' },
        ],
        sortOrder: 3,
      },
      {
        slug: 'jepsi-flycraft',
        title: 'Flycraft Solutions (JEPSI)',
        tagline: 'Aviation Charter & Fueling Platform',
        description: `<p>A high-performance booking and server dispatch architecture built for JEPSI, a premier charter and fueling platform.</p>`,
        coverImage: '/assets/projects/flycraft.jpg',
        techStack: ['Node.js', 'Express', 'React', 'Next.js', 'PostgreSQL', 'Docker'],
        category: 'SaaS',
        role: 'Server Architect & Developer',
        featured: true,
        challenge: `<p>Developing a low-latency flight tracking and dispatch system with secure payment gateway integrations for charter flights.</p>`,
        solution: `<p>Designed an asynchronous microservice server architecture utilizing webhooks and scheduled cron jobs for flight planning updates.</p>`,
        results: `<p>Ensured 99.99% server uptime and reduced manual fueling/dispatch order processes by 30%.</p>`,
        metrics: [
          { label: 'Server Uptime', value: '99.99%' },
          { label: 'Dispatch Process', value: '-30%' },
        ],
        sortOrder: 4,
      },
      {
        slug: 'flexup',
        title: 'FlexUp Billing',
        tagline: 'Subscription Management & Billing Platform',
        description: `<p>SaaS Billing software that automates invoice generation, recurring credit card payments, and dunning workflows.</p>`,
        coverImage: '/assets/projects/flexup.jpg',
        techStack: ['React', 'Next.js', 'Node.js', 'Express', 'MongoDB', 'Stripe'],
        category: 'SaaS',
        role: 'Full Stack Engineer',
        featured: false,
        challenge: `<p>Managing failed subscription payments and automatic retries without disrupting user access.</p>`,
        solution: `<p>Implemented Stripe Webhooks queue handlers to automatically trigger email reminders and restrict tenant access after 3 failed retries.</p>`,
        results: `<p>Recovered 15% of failing subscriptions and automated monthly billing for 200+ active businesses.</p>`,
        metrics: [
          { label: 'Recovered Subs', value: '15%' },
          { label: 'Active Orgs', value: '200+' },
        ],
        sortOrder: 5,
      },
      {
        slug: 'shaadibazaar',
        title: 'Shaadi Bazaar',
        tagline: 'Premium Matrimonial Directory & Event Booking',
        description: `<p>Matrimonial directory helping matches connect and book wedding vendors, photographers, and venues in Pakistan.</p>`,
        coverImage: '/assets/projects/shaadibazaar.jpg',
        techStack: ['React', 'Next.js', 'Tailwind CSS', 'Django', 'PostgreSQL', 'Cloudinary'],
        category: 'Web App',
        role: 'Lead Full Stack Developer',
        featured: true,
        challenge: `<p>Handling complex filtering by city, caste, profession, and availability across thousands of vendor listings.</p>`,
        solution: `<p>Designed an optimized database schema with indexing and utilized Django REST Framework filters for sub-second search results.</p>`,
        results: `<p>Over 100,000+ registered profiles and 5,000+ successful matches made within the first 6 months.</p>`,
        metrics: [
          { label: 'Registered Profiles', value: '100K+' },
          { label: 'Successful Matches', value: '5,000+' },
        ],
        sortOrder: 6,
      },
      {
        slug: 'givart',
        title: 'Givart.org',
        tagline: 'Charity and Art Auction Crowdfunding Platform',
        description: `<p>Crowdfunding and art auction marketplace enabling non-profits to host charity drives and artists to showcase print paintings.</p>`,
        coverImage: '/assets/projects/givart.jpg',
        techStack: ['Vue.js', 'Vuex', 'Vite', 'Node.js', 'PostgreSQL', 'Stripe'],
        category: 'Web App',
        role: 'Full Stack Developer',
        featured: true,
        challenge: `<p>Developing a high-performance interactive layout for mobile payment card scrolling and real-time bid updates.</p>`,
        solution: `<p>Leveraged CSS Flexbox/Grid optimizations, custom touch gestures, and WebSockets to handle real-time bids smoothly.</p>`,
        results: `<p>Raised over $150,000 in charitable donations and facilitated sales for 500+ independent artists.</p>`,
        metrics: [
          { label: 'Donations Raised', value: '$150K+' },
          { label: 'Artists Supported', value: '500+' },
        ],
        sortOrder: 7,
      },
      {
        slug: 'ai-code-reviewer',
        title: 'AI Powered Code Reviewer',
        tagline: 'Automated Pull Request Code Review & Feedback Engine',
        description: `<p>An automated pull request review integration that scans code changes, identifies bugs, checks code standards, and suggests performance refactoring options using Generative AI models.</p>`,
        coverImage: '/assets/projects/code-reviewer.jpg',
        techStack: ['Next.js', 'TypeScript', 'Node.js', 'GitHub Actions', 'Gemini', 'Prisma'],
        category: 'AI Agents',
        role: 'Sole Creator & Architect',
        featured: true,
        challenge: `<p>Processing large git diffs and providing contextual feedback on code logic without hitting token limit boundaries or causing high API billing costs.</p>`,
        solution: `<p>Optimized input token usage by parsing files selectively, utilizing diff boundaries, and chunking reviewer prompts dynamically.</p>`,
        results: `<p>Successfully integrated into 12 active private repos, decreasing pull request QA cycles by 60%.</p>`,
        metrics: [
          { label: 'QA Cycle Time', value: '-60%' },
          { label: 'Token Efficiency', value: '4x' },
        ],
        sortOrder: 8,
      },
      {
        slug: 'event-management-system',
        title: 'Event Management System',
        tagline: 'Scalable Real-time Ticket Booking & Vendor Registration',
        description: `<p>A high-performance ticket booking, check-in, and vendor portal designed to handle high-concurrency ticket sales for large music festivals and conferences.</p>`,
        coverImage: '/assets/projects/events.jpg',
        techStack: ['Next.js', 'React', 'Node.js', 'Express', 'Redis', 'PostgreSQL', 'Stripe'],
        category: 'Marketplace',
        role: 'Full Stack Developer',
        featured: true,
        challenge: `<p>Preventing double-booking and handling inventory locks under heavy concurrency spikes when tickets go live.</p>`,
        solution: `<p>Implemented Redis transaction locks and optimistic concurrency controls on seat records during booking checkouts.</p>`,
        results: `<p>Successfully processed 50,000+ tickets in under 15 minutes during peak sale events with zero double-bookings.</p>`,
        metrics: [
          { label: 'Tickets Processed', value: '50K+' },
          { label: 'Booking Uptime', value: '100%' },
          { label: 'Checkout Latency', value: '< 150ms' },
        ],
        sortOrder: 9,
      },
      {
        slug: 'upteacher-marketplace',
        title: 'UpTeacher',
        tagline: 'Advanced Tutoring Marketplace Backend',
        description: `<p>A comprehensive Django REST Framework backend for a worldwide tutoring marketplace connecting students with teachers. Features custom role-based access, wallet payments with escrow, conflict-free session booking, and real-time support systems.</p>`,
        coverImage: '/assets/projects/upteacher.jpg',
        techStack: ['Django 5.x', 'Django REST Framework', 'PostgreSQL', 'Docker', 'JWT', 'Swagger/OpenAPI'],
        category: 'Marketplace',
        role: 'Backend Architect & Lead Developer',
        featured: true,
        challenge: `<p>Developing a secure wallet system with escrow payments, commissions, and conflict-free calendar booking for student-teacher session schedules.</p>`,
        solution: `<p>Leveraged database transactions, custom Django Signals for profile auto-creation, and optimized calendar availability check logic in serializers.</p>`,
        results: `<p>Delivered a fully documented API under Swagger/OpenAPI with integrated daily statistics reporting and real-time chat capabilities.</p>`,
        metrics: [
          { label: 'Booking Conflicts', value: '0%' },
          { label: 'Escrow Security', value: '100%' },
          { label: 'API Speed', value: '< 100ms' },
        ],
        sortOrder: 10,
      },
      {
        slug: 'kontracko-construction',
        title: 'Kontracko',
        tagline: 'Civil Construction Project & Tender Management SaaS',
        description: `<p>A full-stack Next.js application for managing civil construction projects from tender creation to financial completion. Enforces dedicated user workflows for Engineers, Managers, Constructors, and Finance agents.</p>`,
        coverImage: '/assets/projects/kontracko.jpg',
        techStack: ['Next.js 14', 'TypeScript', 'Prisma', 'SQLite', 'NextAuth.js', 'Tailwind CSS'],
        category: 'SaaS',
        role: 'Sole Developer & Creator',
        featured: true,
        challenge: `<p>Enforcing strict role-based controls for tender bidding, task progress validations, and automated tax-invoice/PO issuance upon final completion.</p>`,
        solution: `<p>Leveraged Next.js App Router for dynamic dash views, Prisma triggers for status transition flows, and NextAuth callbacks for role mapping.</p>`,
        results: `<p>Successfully built a comprehensive construction operations system enabling seamless task updates, budget checks, and financial PO delivery.</p>`,
        metrics: [
          { label: 'Role Workflows', value: '4 Roles' },
          { label: 'PO Billing Speed', value: 'Instant' },
          { label: 'Progress Updates', value: 'Real-time' },
        ],
        sortOrder: 11,
      },
      {
        slug: 'islamic-learning-platform',
        title: 'Islamic Learning Platform',
        tagline: 'AI-Powered Islamic Knowledge & Learning Hub',
        description: `<p>An interactive, AI-driven educational platform developed to make Islamic learning accessible, structured, and interactive. Features real-time AI answering based on authentic sources, progress tracking, and curated course pathways.</p>`,
        coverImage: '/assets/projects/islamic-learning.jpg',
        techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Gemini', 'Prisma'],
        category: 'Chatbots',
        role: 'Lead Full Stack Developer & Architect',
        featured: true,
        challenge: `<p>Ensuring absolute correctness, authenticity, and reference tagging when answering delicate religious or theological questions using AI language models.</p>`,
        solution: `<p>Implemented strict system instructions, prompt filters, and a validation pipeline that references verified theological databases and books before structuring AI outputs.</p>`,
        results: `<p>Created a fast, responsive chatbot platform deployed on Vercel with zero-latency response streaming, utilized by students globally.</p>`,
        metrics: [
          { label: 'Authentic References', value: '100%' },
          { label: 'Streaming Latency', value: '< 200ms' },
          { label: 'User Rating', value: '4.9/5' },
        ],
        sortOrder: 12,
      },
      {
        slug: 'career-path-app',
        title: 'Career Path App',
        tagline: 'AI Career Counselor & Learning Roadmap Generator',
        description: `<p>A personalized AI-powered career counseling app that analyzes user skills, interests, and background to recommend career options and automatically construct step-by-step learning roadmaps.</p>`,
        coverImage: '/assets/projects/career-path.jpg',
        techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Gemini', 'Prisma'],
        category: 'Chatbots',
        role: 'Creator & Lead Full Stack Developer',
        featured: true,
        challenge: `<p>Generating highly dynamic and interactive roadmaps tailored to unique, non-traditional career transitions with clear, sequential steps.</p>`,
        solution: `<p>Designed custom JSON-schema generation using Gemini and rendered interactive node paths using React-flow or dynamic SVG maps.</p>`,
        results: `<p>Helping users map career paths in seconds, generating complete curriculum plans with targeted links to external study materials.</p>`,
        metrics: [
          { label: 'Roadmaps Generated', value: '1,000+' },
          { label: 'Analysis Speed', value: '< 5s' },
          { label: 'Career Paths Supported', value: '50+' },
        ],
        sortOrder: 13,
      },
      {
        slug: 'silquetech-agency',
        title: 'Silquetech Website',
        tagline: 'High-Performance Digital Studio Platform',
        description: `<p>A premium agency landing page, services catalog, and client booking platform built for Silquetech, a digital studio designing and engineering high-performance software products.</p>`,
        coverImage: '/assets/projects/silquetech-site.jpg',
        techStack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Resend', 'Vercel'],
        category: 'Web Applications',
        role: 'Sole Frontend Developer & Designer',
        featured: true,
        challenge: `<p>Designing a state-of-the-art interactive website that loads instantly (A+ Lighthouse score) with dark mode gradients, clean micro-animations, and direct calendar integrations.</p>`,
        solution: `<p>Utilized Next.js App Router static optimization, Tailwind CSS for design-tokens, Framer Motion for premium scroll reveals, and Resend for inquiry forms.</p>`,
        results: `<p>Achieved 100% Lighthouse performance score and increased incoming project inquiries by 40% due to the premium call-to-action layout.</p>`,
        metrics: [
          { label: 'Lighthouse Performance', value: '100/100' },
          { label: 'Conversion Lift', value: '+40%' },
          { label: 'Load Time', value: '0.4s' },
        ],
        sortOrder: 14,
      },
    ],
  })
  console.log('✅ Projects created')

  // 5. Skills
  await prisma.skill.createMany({
    data: [
      { name: 'React', category: 'Frontend', iconSlug: 'react', proficiency: 95, sortOrder: 1 },
      { name: 'Next.js', category: 'Frontend', iconSlug: 'nextjs', proficiency: 92, sortOrder: 2 },
      { name: 'TypeScript', category: 'Frontend', iconSlug: 'typescript', proficiency: 88, sortOrder: 3 },
      { name: 'Vue.js', category: 'Frontend', iconSlug: 'vuejs', proficiency: 85, sortOrder: 4 },
      { name: 'Tailwind CSS', category: 'Frontend', iconSlug: 'tailwindcss', proficiency: 95, sortOrder: 5 },
      { name: 'Django REST', category: 'Backend', iconSlug: 'django', proficiency: 90, sortOrder: 6 },
      { name: 'Node.js', category: 'Backend', iconSlug: 'nodejs', proficiency: 88, sortOrder: 7 },
      { name: 'PostgreSQL', category: 'Backend', iconSlug: 'postgresql', proficiency: 90, sortOrder: 8 },
      { name: 'Python', category: 'Backend', iconSlug: 'python', proficiency: 85, sortOrder: 9 },
      { name: 'Redis', category: 'Backend', iconSlug: 'redis', proficiency: 80, sortOrder: 10 },
      { name: 'Docker', category: 'Tools', iconSlug: 'docker', proficiency: 80, sortOrder: 11 },
      { name: 'Git', category: 'Tools', iconSlug: 'git', proficiency: 92, sortOrder: 12 },
    ],
  })
  console.log('✅ Skills created')

  // 6. Initial chatbot knowledge — seed with bio + key facts
  await prisma.chatKnowledge.createMany({
    data: [
      {
        type: 'QA',
        question: 'Who are you?',
        answer: "I'm Farhan Ahmed, a Full Stack Developer based in Karachi, Pakistan. I specialize in React, Next.js, Django, and PostgreSQL.",
        topic: 'intro',
      },
      {
        type: 'QA',
        question: 'Are you available for freelance work?',
        answer: "Yes! I'm available for freelance, contract, and consulting projects. Feel free to use the contact form or reach me directly.",
        topic: 'availability',
      },
      {
        type: 'QA',
        question: 'What is your tech stack?',
        answer: 'Frontend: React, Next.js, Vue.js, TypeScript, Tailwind CSS. Backend: Django REST Framework, Node.js, Express. Database: PostgreSQL, Redis. Tools: Docker, Vercel, GitHub Actions.',
        topic: 'skills',
      },
      {
        type: 'QA',
        question: 'Tell me about the Islamic Learning Platform project.',
        answer: 'The Islamic Learning Platform is an AI-powered educational platform designed to make Islamic knowledge accessible. It features real-time AI answering based on authentic sources, progress tracking, and curated course pathways. It is built using Next.js, React, TypeScript, Tailwind CSS, Gemini, and Prisma.',
        topic: 'projects',
      },
      {
        type: 'QA',
        question: 'What is the Career Path App?',
        answer: 'The Career Path App is an AI career counselor and learning roadmap generator. It analyzes user skills, interests, and background to recommend career options and automatically construct interactive step-by-step learning roadmaps. It is built with Next.js, React, TypeScript, Tailwind CSS, Gemini, and Prisma.',
        topic: 'projects',
      },
      {
        type: 'QA',
        question: 'Tell me about the AI Powered Code Reviewer.',
        answer: 'The AI Powered Code Reviewer is an AI Agent that automates pull request code reviews. It scans code changes, identifies bugs, checks code standards, and suggests performance refactoring options using Generative AI. Built using Next.js, TypeScript, GitHub Actions, and Gemini.',
        topic: 'projects',
      },
      {
        type: 'QA',
        question: 'What is Silquetech or your role there?',
        answer: 'I work as a Full Stack Developer at Silquetech, a digital studio designing and engineering high-performance software. I led the development of restaurant SaaS platforms, client products, and designed and built the corporate website platform using Next.js, Framer Motion, and Tailwind CSS.',
        topic: 'projects',
      },
    ],
  })
  console.log('✅ Chatbot knowledge database initialized')

  // 7. Site config
  const siteConfigData = {
    seoTitle: 'Farhan Ahmed — Full Stack Developer',
    seoDescription: 'Full Stack Developer in Karachi. React, Next.js, Django, PostgreSQL. Available for freelance.',
    socialLinks: {
      github: 'https://github.com/farhankhan101',
      linkedin: 'https://www.linkedin.com/in/muhammad-farhan-khan-0202b31b6/',
      whatsapp: 'https://wa.me/923079971295',
    },
    contactEmail: 'farhan@silquetech.com',
    footerText: 'Built with Next.js & coffee ☕',
  }

  await prisma.siteConfig.upsert({
    where: { id: 'singleton' },
    update: siteConfigData,
    create: {
      id: 'singleton',
      ...siteConfigData
    },
  })
  console.log('✅ Site config created')

  console.log('✅ Seeding completed successfully!')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
