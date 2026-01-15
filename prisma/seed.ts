import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const projects = [
  { name: 'Viso Internal' },
  { name: 'Client A' },
  { name: 'Client B' },
  { name: 'Personal Development' },
];

async function main(): Promise<void> {
  console.log('Seeding database...');

  for (const project of projects) {
    const existing = await prisma.project.findUnique({
      where: { name: project.name },
    });

    if (!existing) {
      await prisma.project.create({ data: project });
      console.log(`Created project: ${project.name}`);
    } else {
      console.log(`Project already exists: ${project.name}`);
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
