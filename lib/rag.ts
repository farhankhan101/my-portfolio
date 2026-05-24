// lib/rag.ts
import { db } from './db'
import { getEmbedding } from './gemini'

interface RetrievedChunk {
  id: string
  type: string
  question: string | null
  answer: string
  topic: string | null
  similarity: number
}

/**
 * Searches the ChatKnowledge table for relevant knowledge chunks
 */
export async function searchKnowledge(query: string, limit = 5): Promise<RetrievedChunk[]> {
  try {
    const embedding = await getEmbedding(query)
    const vectorString = `[${embedding.join(',')}]`

    // Run raw sql similarity query using pgvector <=> operator (cosine distance)
    // 1 - distance = similarity
    const results = await db.$queryRawUnsafe<any[]>(
      `SELECT 
        id, 
        type::text, 
        question, 
        answer, 
        topic, 
        (1 - (embedding <=> $1::vector)) as similarity
       FROM "ChatKnowledge"
       WHERE embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      vectorString,
      limit
    )

    return results.map(item => ({
      id: item.id,
      type: item.type,
      question: item.question,
      answer: item.answer,
      topic: item.topic,
      similarity: Number(item.similarity || 0),
    }))
  } catch (error) {
    console.error('❌ Error executing pgvector similarity search:', error)
    return []
  }
}

/**
 * Syncs DB contents (About, Projects, Experience, Skills) to ChatKnowledge table chunks
 */
export async function syncDatabaseToKnowledgeBase(): Promise<{ success: boolean; count: number }> {
  try {
    // 1. Delete all auto-synced types (BIO, PROJECT, EXPERIENCE, SKILL)
    await db.chatKnowledge.deleteMany({
      where: {
        type: {
          in: ['BIO', 'PROJECT', 'EXPERIENCE', 'SKILL']
        }
      }
    })

    // Also delete any existing services and why-hire-me custom summaries to rebuild them
    await db.chatKnowledge.deleteMany({
      where: {
        id: {
          in: ['services_summary_singleton', 'why_hire_me_summary_singleton']
        }
      }
    })

    let count = 0

    // 2. Sync BIO from About
    const about = await db.about.findFirst()
    if (about) {
      const bioContent = `About Farhan: Headline: ${about.headline}. Tagline: ${about.tagline}. Location: ${about.location}. Bio details: ${about.bioShort}. Available for: ${about.availableFor.join(', ')}.`
      const embedding = await getEmbedding(bioContent)
      
      await db.$executeRawUnsafe(
        `INSERT INTO "ChatKnowledge" (id, type, answer, topic, embedding, "updatedAt")
         VALUES ($1, 'BIO', $2, 'about', $3::vector, NOW())`,
        `bio_singleton`,
        bioContent,
        `[${embedding.join(',')}]`
      )
      count++
    }

    // 3. Sync each Project
    const projects = await db.project.findMany({
      where: { status: 'PUBLISHED' }
    })
    for (const project of projects) {
      const projectText = `Project Name: ${project.title}. Tagline: ${project.tagline}. Category: ${project.category}. Tech stack: ${project.techStack.join(', ')}. Client: ${project.client || 'N/A'}. Duration: ${project.duration || 'N/A'}. Role: ${project.role || 'N/A'}. Challenge: ${project.challenge || ''}. Solution: ${project.solution || ''}. Results: ${project.results || ''}.`
      const embedding = await getEmbedding(projectText)
      
      await db.$executeRawUnsafe(
        `INSERT INTO "ChatKnowledge" (id, type, answer, topic, embedding, "updatedAt")
         VALUES ($1, 'PROJECT', $2, $3, $4::vector, NOW())`,
        `project_${project.id}`,
        projectText,
        `project_${project.slug}`,
        `[${embedding.join(',')}]`
      )
      count++
    }

    // 4. Sync each Experience
    const experiences = await db.experience.findMany()
    for (const exp of experiences) {
      const expText = `Work Experience at ${exp.company} as ${exp.role} (${exp.type}) in ${exp.location}. Achievements: ${exp.achievements.join('. ')}. Tech stack used: ${exp.techStack.join(', ')}.`
      const embedding = await getEmbedding(expText)

      await db.$executeRawUnsafe(
        `INSERT INTO "ChatKnowledge" (id, type, answer, topic, embedding, "updatedAt")
         VALUES ($1, 'EXPERIENCE', $2, $3, $4::vector, NOW())`,
        `experience_${exp.id}`,
        expText,
        `experience_${exp.company.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        `[${embedding.join(',')}]`
      )
      count++
    }

    // 5. Sync Skills summary & each individual skill
    const skills = await db.skill.findMany()
    if (skills.length > 0) {
      const skillsByCategory = skills.reduce((acc, skill) => {
        acc[skill.category] = acc[skill.category] || []
        acc[skill.category].push(`${skill.name} (${skill.proficiency}%)`)
        return acc
      }, {} as Record<string, string[]>)

      let skillsText = 'Skills breakdown: '
      for (const [category, items] of Object.entries(skillsByCategory)) {
        skillsText += `[${category}]: ${items.join(', ')}. `
      }

      const embedding = await getEmbedding(skillsText)
      await db.$executeRawUnsafe(
        `INSERT INTO "ChatKnowledge" (id, type, answer, topic, embedding, "updatedAt")
         VALUES ($1, 'SKILL', $2, $3, $4::vector, NOW())`,
        `skills_summary_singleton`,
        skillsText,
        `skills`,
        `[${embedding.join(',')}]`
      )
      count++

      for (const skill of skills) {
        const skillText = `Skill Name: ${skill.name}. Category: ${skill.category}. Proficiency level: ${skill.proficiency}%.`
        const skillEmbedding = await getEmbedding(skillText)
        await db.$executeRawUnsafe(
          `INSERT INTO "ChatKnowledge" (id, type, answer, topic, embedding, "updatedAt")
           VALUES ($1, 'SKILL', $2, $3, $4::vector, NOW())`,
          `skill_${skill.id}`,
          skillText,
          `skill_${skill.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          `[${skillEmbedding.join(',')}]`
        )
        count++
      }
    }

    // 6. Sync Services summary
    const servicesText = `Farhan Ahmed's Services and Professional Expertise:
1. Cloud & SaaS Architecture: Designing PostgreSQL databases, Redis layers, and high-performance server APIs using Node.js and Python. Focusing on speed, uptime, and data security.
2. Frontend Engineering: Creating responsive, fluid, and custom-styled web apps using Next.js/React. Focused on UX transitions, performance audits, and high search accessibility.
3. Systems Advisory: Guiding architecture audits, Docker deployments, automated CI/CD pipelines, and configuring cloud server security.
4. AI & RAG Solutions: Building custom RAG workflows, vector database embeddings, chatbot integrations, and LLM pipelines.
5. Database & API Tuning: Designing optimized SQL schemas, query scaling, custom RESTful/GraphQL interfaces, and authentication flows.
6. Premium Interface Design: Fusing modern layouts, color harmony systems, interactive micro-animations, and custom graphics.`
    const servicesEmbedding = await getEmbedding(servicesText)
    await db.$executeRawUnsafe(
      `INSERT INTO "ChatKnowledge" (id, type, answer, topic, embedding, "updatedAt")
       VALUES ($1, 'CUSTOM', $2, $3, $4::vector, NOW())`,
      `services_summary_singleton`,
      servicesText,
      `services`,
      `[${servicesEmbedding.join(',')}]`
    )
    count++

    // 7. Sync Why Hire Me summary
    const whyHireMeText = `Why hire or partner with Farhan Ahmed:
1. Clean, Maintainable Architectures: No spaghetti code. Structured logically with modular components, separation of concerns, and clean databases, making it simple for teams to take over.
2. Transparent Communication: Clear expectation-setting, detailed task trackers, video updates, and robust documentation.
3. Performance & Speed Optimization: Fine-tuned to load in milliseconds. Optimized bundles, advanced caching strategies, and asset compression.
4. Security-First Approach: Strict validation, input sanitization, secure cookie storage, and database encryption.
5. AI & RAG Integration Experience: Integrating advanced AI features, LLM workflows, custom embeddings, vector databases, and semantic search queries directly.
6. Scalable System Engineering: Designing scalable database schemas, Redis caching layers, and high-performance server APIs.
7. Production-Ready CI/CD & Cloud: Automated deployments, secure environment management, serverless configurations, and robust Docker orchestration.
8. End-to-End Product Ownership: Helping design the product roadmap, optimize user retention flows, and align technical architecture with business strategy.`
    const whyHireMeEmbedding = await getEmbedding(whyHireMeText)
    await db.$executeRawUnsafe(
      `INSERT INTO "ChatKnowledge" (id, type, answer, topic, embedding, "updatedAt")
       VALUES ($1, 'CUSTOM', $2, $3, $4::vector, NOW())`,
      `why_hire_me_summary_singleton`,
      whyHireMeText,
      `why_hire_me`,
      `[${whyHireMeEmbedding.join(',')}]`
    )
    count++

    return { success: true, count }
  } catch (error) {
    console.error('❌ Error running knowledge base sync:', error)
    return { success: false, count: 0 }
  }
}
