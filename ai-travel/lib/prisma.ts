import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

// Required for Neon serverless driver to work in Node.js environments
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter: new PrismaNeon(new Pool({ connectionString })),
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
