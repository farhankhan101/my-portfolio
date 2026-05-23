// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
const isGeminiConfigured = apiKey && !apiKey.includes('YourGeminiAPIKey') && apiKey.trim() !== ''

const genAI = isGeminiConfigured ? new GoogleGenerativeAI(apiKey) : null

/**
 * Generates an vector embedding (768 dimensions) using text-embedding-004
 */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!genAI) {
    console.warn("⚠️ [Gemini Sandbox] Generating dummy vector embedding for: ", text.slice(0, 50) + "...")
    // Generate a reproducible vector representation by hash
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash)
    }
    const dummy: number[] = []
    for (let i = 0; i < 768; i++) {
      const seed = Math.sin(hash + i) * 10000
      dummy.push(seed - Math.floor(seed) - 0.5)
    }
    // Normalize vector
    const magnitude = Math.sqrt(dummy.reduce((sum, val) => sum + val * val, 0))
    return dummy.map(val => val / magnitude)
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' })
    const result = await model.embedContent(text)
    const values = result.embedding.values
    if (values.length > 768) {
      const sliced = values.slice(0, 768)
      const magnitude = Math.sqrt(sliced.reduce((sum, val) => sum + val * val, 0))
      return sliced.map(val => val / magnitude)
    }
    return values
  } catch (error) {
    console.error('❌ Error getting embedding from Gemini API:', error)
    throw error
  }
}

interface ChatHistoryItem {
  role: 'user' | 'model'
  parts: string[]
}

/**
 * Returns a streaming Response body using gemini-1.5-flash
 */
export async function generateChatStream(
  systemPrompt: string,
  userMessage: string,
  history: ChatHistoryItem[] = []
): Promise<ReadableStream> {
  const encoder = new TextEncoder()

  if (!genAI) {
    console.warn("⚠️ [Gemini Sandbox] Generating simulated chat stream response.")
    return new ReadableStream({
      async start(controller) {
        const text = `[Gemini Sandbox Mode] Hi! I'm Farhan's AI Assistant. Because you are testing locally without a live Google Gemini API Key, I am running in Sandbox Mode. You asked: "${userMessage}". Farhan is a Senior Full Stack Developer at Silquetech with 5+ years of experience in React, Next.js, Django, and PostgreSQL. Feel free to contact him directly at farhan@silquetech.com!`
        const words = text.split(" ")
        for (const word of words) {
          controller.enqueue(encoder.encode(word + " "))
          await new Promise((resolve) => setTimeout(resolve, 40))
        }
        controller.close()
      }
    })
  }

  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    })

    // Convert history format to match SDK requirements
    const contents = history.map(item => ({
      role: item.role,
      parts: item.parts.map(p => ({ text: p }))
    }))

    // Add latest user input
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    })

    const resultStream = await model.generateContentStream({
      contents,
    })

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of resultStream.stream) {
            const chunkText = chunk.text()
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText))
            }
          }
          controller.close()
        } catch (streamErr) {
          console.error('❌ Stream generation chunk error:', streamErr)
          controller.error(streamErr)
        }
      }
    })
  } catch (error: any) {
    console.error('❌ Error initiating chat stream from Gemini API:', error)
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`Error generating response: ${error?.message || error}`))
        controller.close()
      }
    })
  }
}

/**
 * Uses gemini-2.5-flash to refine a Q&A answer based on user feedback/instructions.
 */
export async function refineAnswerWithAI(
  question: string,
  originalAnswer: string,
  instruction: string
): Promise<string> {
  if (!genAI) {
    return `[Gemini Sandbox] Refined answer for: "${question}". Feedback: "${instruction}". Original answer: "${originalAnswer}". (Please configure a real API key for dynamic AI refinement.)`
  }

  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    })

    const prompt = `
You are a professional writing assistant helping Farhan Ahmed (a Senior Full Stack Developer) train his portfolio chatbot.

User asked this question:
"${question}"

The chatbot originally answered:
"${originalAnswer}"

Farhan wants to correct/refine this response with these instructions/details:
"${instruction}"

Generate a polished, professional, first-person response that Farhan would say.
Guidelines:
1. Speak in first-person ("I", "my") as Farhan.
2. Keep it accurate, concise, and focused on full stack development.
3. Write ONLY the refined answer text. Do not include introductory or concluding phrases (like "Here is the refined response:" or formatting prefixes). Output the direct, clean response text.
`

    const result = await model.generateContent(prompt)
    return result.response.text().trim()
  } catch (error) {
    console.error('❌ Error refining answer with Gemini:', error)
    throw error
  }
}
