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

prisma.$use(async (params, next) => {
  if (
    params.model === "StrainReview" &&
    (params.action === "create" || params.action === "update")
  ) {
    const data = params.args.data;
    let flavor = data.flavor as number | undefined;
    let effect = data.effect as number | undefined;
    let smoke = data.smoke as number | undefined;

    if (params.action === "update") {
      const existing = await prisma.strainReview.findUnique({
        where: params.args.where,
      });
      flavor = flavor ?? existing?.flavor ?? 0;
      effect = effect ?? existing?.effect ?? 0;
      smoke = smoke ?? existing?.smoke ?? 0;
    }

    if (flavor !== undefined && effect !== undefined && smoke !== undefined) {
      data.aggregateRating = (flavor + effect + smoke) / 3;
    }
  }
  return next(params);
});

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
