import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/messages - Save a new message to a chat
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { chatId, role, content } = await req.json();

        if (!chatId || !role || !content) {
            return Response.json({ error: "Missing fields" }, { status: 400 });
        }

        // Handle offline/mock chats
        if (chatId.startsWith("offline-")) {
            return Response.json({
                id: "msg-" + Date.now(),
                chatId,
                role,
                content,
                createdAt: new Date()
            });
        }

        try {
            // Verify ownership of the chat
            const chat = await prisma.chat.findUnique({
                where: { id: chatId },
                include: {
                    user: true,
                    messages: {
                        select: { id: true },
                        take: 1,
                    },
                },
            });

            if (!chat || chat.user.email !== session.user.email) {
                return Response.json({ error: "Chat not found or access denied" }, { status: 404 });
            }

            // Save the message
            const newMessage = await prisma.message.create({
                data: {
                    chatId,
                    role,
                    content,
                },
            });

            // Update chat updated_at
            await prisma.chat.update({
                where: { id: chatId },
                data: { updatedAt: new Date() },
            });

            // Optionally update title if it's the first user message
            if (role === 'user' && chat.messages && chat.messages.length === 0) {
                // Simple title generation (first 50 chars)
                await prisma.chat.update({
                    where: { id: chatId },
                    data: { title: content.substring(0, 50) + (content.length > 50 ? "..." : "") }
                });
            }

            return Response.json(newMessage);
        } catch (dbError) {
            console.warn("Database unavailable, returning mock message:", dbError);
            return Response.json({
                id: "msg-" + Date.now(),
                chatId,
                role,
                content,
                createdAt: new Date()
            });
        }
    } catch (error) {
        console.error("API Error:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
