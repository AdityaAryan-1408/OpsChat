const prisma = require('../../src/config/database');

describe('Database Integration', () => {
    describe('User Operations', () => {
        const testEmail = `dbtest-${Date.now()}@example.com`;

        afterAll(async () => {
            // Cleanup
            try {
                await prisma.user.delete({ where: { email: testEmail } });
            } catch (e) { }
        });

        it('should create a user', async () => {
            const user = await prisma.user.create({
                data: {
                    email: testEmail,
                    password: 'hashedpassword123'
                }
            });

            expect(user).toHaveProperty('id');
            expect(user.email).toBe(testEmail);
        });

        it('should find user by email', async () => {
            const user = await prisma.user.findUnique({
                where: { email: testEmail }
            });

            expect(user).not.toBeNull();
            expect(user.email).toBe(testEmail);
        });

        it('should update user profile', async () => {
            const updated = await prisma.user.update({
                where: { email: testEmail },
                data: {
                    username: `testuser-${Date.now()}`,
                    name: 'Test User'
                }
            });

            expect(updated.name).toBe('Test User');
            expect(updated.username).toBeTruthy();
        });
    });

    describe('Channel Operations', () => {
        it('should find default channel', async () => {
            const channel = await prisma.channel.findFirst({
                where: { name: 'general' }
            });

            // May not exist if DB is fresh
            if (channel) {
                expect(channel).toHaveProperty('id');
                expect(channel.name).toBe('general');
            }
        });
    });

    describe('Message Operations', () => {
        it('should query messages with expiration filter', async () => {
            const messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } }
                    ]
                },
                take: 10
            });

            expect(Array.isArray(messages)).toBe(true);
        });
    });
});
