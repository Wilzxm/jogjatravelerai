const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' }); // Load .env.local explicitly if needed, or just let Prisma load from .env
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Connecting to database...");
        await prisma.$connect();
        console.log("Connected successfully!");
        const userCount = await prisma.user.count();
        console.log(`User count: ${userCount}`);
    } catch (error) {
        console.error("Connection failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
