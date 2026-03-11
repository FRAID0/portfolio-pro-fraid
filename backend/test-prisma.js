const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const projects = await prisma.project.findMany();
        console.log(projects);
    } catch (e) {
        console.error("PRISMA ERROR:", e);
    } finally {
        await prisma.$disconnect();
    }
}
test();
