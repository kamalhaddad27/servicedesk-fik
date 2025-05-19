// types/next-auth.d.ts
import NextAuth from "next-auth"
import { User as AppUser } from "./index" // alias lo

declare module "next-auth" {
  interface Session {
    user: AppUser
    accessToken: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number
    role: AppUser["role"]
    department: string
    accessToken: string
  }
}
