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

    // 5. Sync Skills summary
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
    }

    return { success: true, count }
  } catch (error) {
    console.error('❌ Error running knowledge base sync:', error)
    return { success: false, count: 0 }
  }
}
