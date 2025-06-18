import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";

export async function POST(request: Request) {
  const { name, category } = await request.json();
  await prisma.producer.create({ data: { name, category } });
  return NextResponse.json({ ok: true });
}