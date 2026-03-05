import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function getSession() {
  return getServerSession(authOptions)
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession()
  return session?.user?.id ?? null
}

export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error("Unauthorized")
  }
  return userId
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}
