'use client'

import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
  enabled?: boolean
}

export function AuthProvider({ children, enabled = true }: AuthProviderProps) {
  if (!enabled) return <>{children}</>
  return <SessionProvider>{children}</SessionProvider>
}
