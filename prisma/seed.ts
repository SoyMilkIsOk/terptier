import { PrismaClient, Category, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL },
  },
});

async function main() {
  await prisma.$executeRawUnsafe("DEALLOCATE ALL;");

  const stateSeeds = [
    { code: "CO", name: "Colorado", slug: "colorado" },
    { code: "CA", name: "California", slug: "california" },
    { code: "OR", name: "Oregon", slug: "oregon" },
    { code: "WA", name: "Washington", slug: "washington" },
    { code: "MA", name: "Massachusetts", slug: "massachusetts" },
    { code: "MD", name: "Maryland", slug: "maryland" },
    { code: "VT", name: "Vermont", slug: "vermont" },
    { code: "ME", name: "Maine", slug: "maine" },
  ];

  for (const state of stateSeeds) {
    await prisma.state.upsert({
      where: { code: state.code },
      update: {},
      create: state,
    });
  }

  const colorado = await prisma.state.findUnique({ where: { code: "CO" } });

  if (!colorado) {
    throw new Error("Colorado state not found; cannot seed producers");
  }
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
      where: {
        stateId_name_category: {
          stateId: colorado.id,
          name,
          category: Category.FLOWER,
        },
      },
      update: {},
      create: { name, category: Category.FLOWER, stateId: colorado.id },
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
      where: {
        stateId_name_category: {
          stateId: colorado.id,
          name,
          category: Category.HASH,
        },
      },
      update: {},
      create: { name, category: Category.HASH, stateId: colorado.id },
    });
  }

  // 4) Seed a producer admin user and link to a couple producers
  const producerAdminPass = process.env.PRODUCER_ADMIN_PASS || "changeme";
  const adminHash = await bcrypt.hash(producerAdminPass, 10);
  const producerAdmin = await prisma.user.upsert({
    where: { email: "producer_admin@example.com" },
    update: {},
    create: {
      email: "producer_admin@example.com",
      name: "Producer Admin",
      passwordHash: adminHash,
      role: Role.PRODUCER_ADMIN,
    },
  });

  const someProducers = await prisma.producer.findMany({ take: 2 });
  for (const producer of someProducers) {
    await prisma.producerAdmin.upsert({
      where: { userId_producerId: { userId: producerAdmin.id, producerId: producer.id } },
      update: {},
      create: { userId: producerAdmin.id, producerId: producer.id },
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
