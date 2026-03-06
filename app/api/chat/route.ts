import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { streamText, convertToModelMessages } from "ai"
import { google } from "@ai-sdk/google"
import { checkAndIncrementChatUsage } from "@/lib/chat-rate-limit"

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
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { allowed } = await checkAndIncrementChatUsage(session.user.id)
  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: "Chat limit reached",
        message: "You've used your 100 chat messages for today. Limit resets tomorrow.",
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    )
  }

  const { messages } = await request.json()

  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: google("gemini-1.5-flash"),
    system: coachSystemPrompt,
    messages: modelMessages,
  })

  return result.toUIMessageStreamResponse()
}
