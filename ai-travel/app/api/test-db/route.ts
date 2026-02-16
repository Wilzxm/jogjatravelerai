import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        await prisma.$connect();
        return Response.json({ status: "ok", message: "Prisma connected successfully" });
    } catch (error) {
        console.error("Prisma Connection Error:", error);
        return Response.json({ status: "error", error: String(error) }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
