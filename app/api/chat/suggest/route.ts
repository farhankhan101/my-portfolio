// app/api/chat/suggest/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
const isGeminiConfigured = apiKey && !apiKey.includes('YourGeminiAPIKey') && apiKey.trim() !== ''
const genAI = isGeminiConfigured ? new GoogleGenerativeAI(apiKey) : null

export async function POST(req: NextRequest) {
  try {
    const { message, reply } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Last user message is required' }, { status: 400 })
    }

    // Check Sandbox Mode
    if (!genAI) {
      const msgLower = message.toLowerCase()
      let suggestions = [
        'What is your primary tech stack?',
        'Are you available for freelance projects?',
        'Tell me about your SaaS experience.',
      ]

      if (msgLower.includes('stack') || msgLower.includes('tech') || msgLower.includes('skill')) {
        suggestions = [
          'Can you show me projects built with Next.js?',
          'Do you have experience with cloud or DevOps?',
          'Tell me about your Django expertise.',
        ]
      } else if (msgLower.includes('project') || msgLower.includes('work') || msgLower.includes('portfolio') || msgLower.includes('silquerm')) {
        suggestions = [
          'Tell me more about the SilqueRM SaaS.',
          'Have you built any aviation charter platforms?',
          'What was your role at Flycraft Solutions?',
        ]
      } else if (msgLower.includes('hire') || msgLower.includes('contact') || msgLower.includes('freelance') || msgLower.includes('available')) {
        suggestions = [
          'What is your preferred mode of collaboration?',
          'How can I get in touch with you?',
          'Do you do consulting or code audits?',
        ]
      }

      return NextResponse.json({ suggestions })
    }

    // Call Gemini API to generate suggestions
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    })

    const prompt = `
You are an AI assistant helping Farhan Ahmed (a Senior Full Stack Developer).
Given the last question the user asked, and the assistant's response, generate exactly 3 short, relevant, and engaging follow-up questions that the user might want to ask next about Farhan, his skills, or his projects.
Keep the questions concise (maximum 7-8 words each). Make sure they are tailored directly to the conversation content.

User's last question:
"${message}"

Assistant's response:
"${reply || ''}"

Output MUST be a valid JSON object with a single key "suggestions" containing an array of 3 strings.
Example:
{
  "suggestions": [
    "What is your Next.js experience?",
    "Can you share more about SilqueRM?",
    "Are you open to contract roles?"
  ]
}
`

    const result = await model.generateContent(prompt)
    const textResponse = result.response.text().trim()
    
    try {
      const parsed = JSON.parse(textResponse)
      if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
        return NextResponse.json({ suggestions: parsed.suggestions.slice(0, 3) })
      }
    } catch (parseErr) {
      console.warn('Failed to parse Gemini suggestions JSON response:', textResponse, parseErr)
    }

    // Fallback if parsing or generation failed
    return NextResponse.json({
      suggestions: [
        'Can you tell me more about your experience?',
        'What projects are you most proud of?',
        'How can we start working together?',
      ]
    })
  } catch (error) {
    console.error('❌ Suggestions API error:', error)
    return NextResponse.json({
      suggestions: [
        'What is your primary tech stack?',
        'Are you available for freelance projects?',
        'Tell me about your SaaS experience.',
      ]
    })
  }
}
