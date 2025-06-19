import { PrismaClient, Category, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL },
  },
});

async function main() {
  await prisma.$executeRawUnsafe("DEALLOCATE ALL;");
  // 1) Create admin user from env
  const adminPass = process.env.ADMIN_PASS || "changeme";
  const hash = await bcrypt.hash(adminPass, 10);
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL! },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL!,
      name: "Admin",
      passwordHash: hash,
      role: Role.ADMIN,
    },
  });

  // 2) Seed flower producers
  const flowerNames = [
    "Locol Love",
    "Grateful Grove",
    "SPCY",
    "GreenDot",
    "Verde",
    "14er",
    "Fox",
    "Cherry",
    "710Labs",
    "Malek’s",
    "Indico",
    "Melody Genetics",
  ];
  for (const name of flowerNames) {
    await prisma.producer.upsert({
      where: { name_category: { name, category: Category.FLOWER } },
      update: {},
      create: { name, category: Category.FLOWER },
    });
  }

  // 3) Seed hash producers
  const hashNames = [
    "Soiku Bano",
    "710Labs",
    "LazerCat",
    "Dablogic",
    "InHouse",
    "Sunshine",
    "Locol Love",
    "Rivers",
    "Allgreens",
    "Malek’s",
    "GreenDot",
  ];
  for (const name of hashNames) {
    await prisma.producer.upsert({
      where: { name_category: { name, category: Category.HASH } },
      update: {},
      create: { name, category: Category.HASH },
    });
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
