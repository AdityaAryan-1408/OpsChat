const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {

    const hashedPassword = await bcrypt.hash('password123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@opschat.io' },
        update: {},
        create: {
            email: 'admin@opschat.io',
            username: 'admin',
            password: hashedPassword,
            name: 'System Admin',
        },
    });


    const workspace = await prisma.workspace.upsert({
        where: { slug: 'default' },
        update: {},
        create: {
            name: 'Default Workspace',
            slug: 'default',
            ownerId: admin.id,
            members: {
                create: {
                    userId: admin.id,
                    role: 'ADMIN',
                },
            },
        },
    });

    const channel = await prisma.channel.upsert({
        where: {
            workspaceId_name: {
                workspaceId: workspace.id,
                name: 'general'
            }
        },
        update: {},
        create: {
            name: 'general',
            workspaceId: workspace.id,
        },
    });

    console.log({ admin, workspace, channel });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });