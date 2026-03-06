import { prisma } from "@/lib/prisma"

const CHAT_LIMIT_PER_MONTH = 200

function getCurrentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

export async function checkAndIncrementChatUsage(userId: string): Promise<{
  allowed: boolean
  remaining: number
}> {
  const month = getCurrentMonth()

  const existing = await prisma.chatUsage.findUnique({
    where: { userId_month: { userId, month } },
  })

  const currentCount = existing?.count ?? 0
  if (currentCount >= CHAT_LIMIT_PER_MONTH) {
    return { allowed: false, remaining: 0 }
  }

  await prisma.chatUsage.upsert({
    where: { userId_month: { userId, month } },
    create: { userId, month, count: 1 },
    update: { count: { increment: 1 } },
  })

  const remaining = CHAT_LIMIT_PER_MONTH - currentCount - 1
  return { allowed: true, remaining }
}
