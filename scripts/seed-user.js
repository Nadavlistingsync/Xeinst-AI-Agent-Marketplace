// scripts/seed-user.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_USER_EMAIL || 'admin@example.com';
  const password = process.env.SEED_USER_PASSWORD || 'changeme123';
  const name = process.env.SEED_USER_NAME || 'Admin';
  const role = process.env.SEED_USER_ROLE || 'user';

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name,
      password: hashedPassword,
      role,
    },
  });

  console.log(`Seeded user: ${user.email} (password: ${password})`);
}

main()
  .catch((e) => { throw e; })
  .finally(() => prisma.$disconnect()); 