import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chats - List all chats for current user
export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
            });

            if (!user) {
                // Should not happen if Auth is working correctly
                return Response.json({ error: "User not found" }, { status: 404 });
            }

            const chats = await prisma.chat.findMany({
                where: { userId: user.id },
                orderBy: { updatedAt: "desc" },
                select: { id: true, title: true, updatedAt: true },
            });

            return Response.json(chats);
        } catch (dbError) {
            console.warn("Database unavailable, returning empty list for demo/offline mode:", dbError);
            return Response.json([]); // Return empty list so frontend doesn't crash
        }
    } catch (authError) {
        console.error("Auth error:", authError);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST /api/chats - Create a new chat
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
            });

            if (!user) {
                return Response.json({ error: "User not found" }, { status: 404 });
            }

            // Create a new chat
            const newChat = await prisma.chat.create({
                data: {
                    userId: user.id,
                    title: "Rencana Liburan Baru",
                },
            });

            return Response.json(newChat);
        } catch (dbError) {
            console.warn("Database unavailable, returning mock chat for demo:", dbError);
            // Return a mock chat object so frontend continues working in memory
            return Response.json({
                id: "offline-chat-" + Date.now(),
                title: "Chat Demo (Offline)",
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
    } catch (error) {
        console.error("API Error:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
