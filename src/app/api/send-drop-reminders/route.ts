import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase env vars missing");
    return NextResponse.json({ success: false, error: "Server misconfig" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const now = new Date();
  const end = new Date();
  end.setDate(now.getDate() + 7);

  const strains = await prisma.strain.findMany({
    where: {
      releaseDate: {
        gte: now,
        lte: end,
      },
    },
    include: { producer: true },
  });

  const byProducer = new Map<string, string[]>();
  for (const s of strains) {
    const list = byProducer.get(s.producer.name) || [];
    list.push(s.name);
    byProducer.set(s.producer.name, list);
  }

  const message =
    Array.from(byProducer.entries())
      .map(([producer, names]) => `${producer}: ${names.join(", ")}`)
      .join("\n") || "No drops scheduled for this week.";

  const jobs = await prisma.notificationJob.findMany({
    where: {
      sentAt: null,
      scheduledAt: { lte: now },
    },
    include: {
      notification: {
        include: {
          user: { include: { notificationPreferences: true } },
        },
      },
    },
  });

  for (const job of jobs) {
    const email = job.notification.user.email;
    const pref = job.notification.user.notificationPreferences[0];
    if (!email || (pref && pref.email === false)) continue;

    const locked = await prisma.notificationJob.updateMany({
      where: { id: job.id, sentAt: null },
      data: { sentAt: new Date() },
    });
    if (locked.count === 0) continue;

    try {
      await supabase.functions.invoke("send-email", {
        body: { to: email, subject: "Upcoming Drops", text: message },
      });
    } catch (err) {
      console.error("send-email failed", err);
      await prisma.notificationJob.update({
        where: { id: job.id },
        data: { sentAt: null },
      });
    }
  }

  return NextResponse.json({ success: true, processed: jobs.length });
}
