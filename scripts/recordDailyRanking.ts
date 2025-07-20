import { prisma } from "@/lib/prismadb";
import { Category } from "@prisma/client";

export async function recordDailyRanking() {
  for (const category of [Category.FLOWER, Category.HASH]) {
    const producers = await prisma.producer.findMany({
      where: { category },
      include: { votes: true },
    });

    const ranked = producers
      .map((p) => ({
        id: p.id,
        avg: p.votes.length
          ? p.votes.reduce((s, v) => s + v.value, 0) / p.votes.length
          : 0,
      }))
      .sort((a, b) => b.avg - a.avg);

    for (const [index, p] of ranked.entries()) {
      await prisma.producerRatingSnapshot.create({
        data: {
          producerId: p.id,
          averageRating: p.avg,
          categoryRank: index + 1,
        },
      });
    }
  }
}

if (require.main === module) {
  recordDailyRanking()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
