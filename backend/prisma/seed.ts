import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { DEMO_USERS } from '../src/auth/demo-users.js';
const prisma = new PrismaClient({
  adapter: new PrismaPg(
    { connectionString: process.env.DATABASE_URL },
    {
      schema:
        new URL(process.env.DATABASE_URL!).searchParams.get('schema') ||
        'public',
    },
  ),
});
try {
  for (const user of DEMO_USERS)
    await prisma.user.upsert({
      where: { id: user.id },
      create: user,
      update: { name: user.name, email: user.email },
    });
  console.log('Seeded three demo accounts.');
} finally {
  await prisma.$disconnect();
}
