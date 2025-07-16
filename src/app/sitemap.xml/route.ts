import { prisma } from "@/lib/prismadb";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;

  const staticPaths = [
    "",
    "/about",
    "/faq",
    "/privacy",
    "/terms",
    "/login",
    "/signup",
    "/rankings",
  ];

  const producers = await prisma.producer.findMany({
    select: { slug: true, id: true },
  });
  const producerPaths = producers.map((p) => `/producer/${p.slug ?? p.id}`);

  const users = await prisma.user.findMany({
    select: { username: true, id: true },
  });
  const profilePaths = users.map((u) => `/profile/${u.username ?? u.id}`);

  const urls = [...staticPaths, ...producerPaths, ...profilePaths].map((path) => {
    const loc = `${baseUrl}${path}`;
    return `<url><loc>${loc}</loc></url>`;
  });

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.join("") +
    `</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

