import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const authConfig = {
    providers: [
        Google,
        Credentials({
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
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname === "/";
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false;
            }
            return true;
        },
    },
} satisfies NextAuthConfig
