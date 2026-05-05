import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// 🔥 DEBUG VERCEL ENV
console.log("=== ENV DEBUG ===")
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "ADA" : "KOSONG")
console.log("AUTH_SECRET:", process.env.AUTH_SECRET ? "ADA" : "KOSONG")
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "ADA" : "KOSONG")
console.log("=================")

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },

    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            name: "Guest (Demo)",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                if (credentials?.email === "user@example.com" && credentials?.password === "password") {
                    return { id: "1", name: "Demo User", email: "user@example.com" }
                }
                return null;
            },
        })
    ],

    secret: process.env.AUTH_SECRET,
})
