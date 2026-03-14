import { auth } from './config'

export async function getSession() {
  return await auth()
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Authentication required')
  }
  return session
}

interface CurrentUser {
  id: string
  username: string
  name: string | null | undefined
  image: string | null | undefined
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth()
  if (!session?.user?.username) return null
  return {
    id: session.user.id as string,
    username: session.user.username as string,
    name: session.user.name,
    image: session.user.image,
  }
}
