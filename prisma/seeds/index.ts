import { PrismaClient } from '@prisma/client';
import { seedMembers } from './member.seed';
import { seedUsers } from './user.seed';
import { seedNewsArticles } from './newsarticles.seed';

const prisma = new PrismaClient();

async function main() {
  await seedUsers();
  await seedNewsArticles();
  if (process.env.DATABASE_URL?.includes('test')) {
    await seedMembers();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
