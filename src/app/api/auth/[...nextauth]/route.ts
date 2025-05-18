import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { ApiService } from "@/lib/api"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        nim: { label: "NIM", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null

        try {
          let authResponse

          if (credentials.email) {
            authResponse = await ApiService.loginWithEmail(credentials.email, credentials.password)
          } else if (credentials.nim) {
            authResponse = await ApiService.loginWithNIM(credentials.nim, credentials.password)
          } else {
            throw new Error("Email atau NIM diperlukan")
          }

          if (authResponse && authResponse.access_token) {
            return {
              id: String(authResponse.user.id),
              name: authResponse.user.name,
              email: authResponse.user.email,
              role: authResponse.user.role,
              department: authResponse.user.department,
              accessToken: authResponse.access_token,
              ...authResponse.user,
            }
          }

          return null
        } catch (error) {
          console.error("Auth error:", error)
          throw new Error("Kredensial tidak valid")
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.department = user.department
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.department = token.department as string
        session.accessToken = token.accessToken as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
