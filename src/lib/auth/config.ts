import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import { getSupabaseAdmin } from './supabase'

function isAuthConfigured(): boolean {
  return Boolean(
    process.env['GITHUB_CLIENT_ID'] &&
    process.env['GITHUB_CLIENT_SECRET'] &&
    process.env['NEXTAUTH_SECRET'],
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: isAuthConfigured()
    ? [
        GitHubProvider({
          clientId: process.env['GITHUB_CLIENT_ID'] ?? '',
          clientSecret: process.env['GITHUB_CLIENT_SECRET'] ?? '',
          authorization: {
            params: {
              scope: 'read:user user:email',
            },
          },
        }),
      ]
    : [],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !profile) return false

      const supabase = getSupabaseAdmin()
      if (!supabase) {
        // Supabase not configured — allow sign-in but skip DB sync
        return true
      }

      const { error } = await supabase.from('users').upsert(
        {
          github_id: Number(profile.id),
          username: (profile as { login: string }).login,
          display_name: user.name ?? '',
          avatar_url: user.image ?? '',
          bio: (profile as { bio?: string }).bio ?? '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'github_id' },
      )

      if (error) {
        return false
      }
      return true
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
        session.user.username = token.username as string
      }
      return session
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.username = (profile as { login: string }).login
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  secret: process.env['NEXTAUTH_SECRET'],
})

export { isAuthConfigured }
