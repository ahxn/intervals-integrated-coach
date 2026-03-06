import { prisma } from "@/lib/prisma"

const CHAT_LIMIT_PER_DAY = 100

function getCurrentDay(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export async function checkAndIncrementChatUsage(
  userId: string
): Promise<{
  allowed: boolean
  remaining: number
}> {
  const day = getCurrentDay()

  const existing = await prisma.chatUsage.findUnique({
    where: { userId_day: { userId, day } },
  })

  const currentCount = existing?.count ?? 0

  if (currentCount >= CHAT_LIMIT_PER_DAY) {
    return { allowed: false, remaining: 0 }
  }

  await prisma.chatUsage.upsert({
    where: { userId_day: { userId, day } },
    create: { userId, day, count: 1 },
    update: { count: { increment: 1 } },
  })

  return {
    allowed: true,
    remaining: CHAT_LIMIT_PER_DAY - currentCount - 1,
  }
}