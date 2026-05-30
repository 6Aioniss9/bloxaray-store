import NextAuth from 'next-auth'
import Discord from 'next-auth/providers/discord'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const adminIds = (process.env.ADMIN_IDS ?? '').split(',').map((s) => s.trim())
      return adminIds.length === 0 || adminIds.includes(user.id ?? '')
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  trustHost: true,
})
