import { PrismaClient } from "@prisma/client";

declare global {
  // avoid multiple instances in development
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Disable prepared statements when using a direct connection to
// avoid `bind message` errors. The query engine recognizes the
// `pgbouncer=true` parameter and switches to simple query mode.
const baseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const url = baseUrl?.includes("pgbouncer=true")
  ? baseUrl
  : `${baseUrl}?pgbouncer=true`;

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasourceUrl: url,
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
