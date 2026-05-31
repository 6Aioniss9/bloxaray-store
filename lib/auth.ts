import NextAuth from 'next-auth'
import Discord from 'next-auth/providers/discord'
import { prisma } from '@/lib/prisma'

function getAdminIds(): Set<string> {
  const raw = process.env.ADMIN_IDS ?? ''
  return new Set(
    raw.split(',').map((id) => id.trim()).filter(Boolean)
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.id || account?.provider !== 'discord') return false

      try {
        await prisma.user.upsert({
          where: { discordId: account.providerAccountId },
          update: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          },
          create: {
            discordId: account.providerAccountId,
            name: user.name ?? 'Unknown',
            image: user.image ?? undefined,
            email: user.email ?? undefined,
          },
        })
      } catch (err) {
        console.error('[AUTH] signIn DB error:', err instanceof Error ? err.message : err)
        return false
      }

      return true
    },

    async jwt({ token, account, profile }) {
      if (account?.provider === 'discord' && account.providerAccountId) {
        token.discordId = account.providerAccountId
        token.isAdmin = getAdminIds().has(account.providerAccountId)
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        if (token.discordId) {
          session.user.discordId = token.discordId as string
        }
        session.user.isAdmin = false
        if (session.user.discordId) {
          session.user.isAdmin = getAdminIds().has(session.user.discordId)
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
  },
  trustHost: true,
})
