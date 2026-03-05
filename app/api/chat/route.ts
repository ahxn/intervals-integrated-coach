import { auth } from '@/lib/auth'
import { streamText, convertToModelMessages } from 'ai'

const coachSystemPrompt = `You are an expert running coach with 15+ years of experience. You help runners improve their performance, prevent injuries, and achieve their goals. 

When responding:
- Be encouraging and supportive
- Ask clarifying questions when needed
- Provide specific, actionable advice
- Consider the runner's individual circumstances and training history
- Reference training principles and science when relevant
- Help them understand WHY certain recommendations matter

Keep responses concise but helpful. Format lists with bullet points when appropriate.`

export async function POST(request: Request) {
  const session = await auth()

  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages } = await request.json()

  // Convert UIMessage format to ModelMessage format if needed
  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: coachSystemPrompt,
    messages: modelMessages,
  })

  return result.toUIMessageStreamResponse()
}
