import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

type StateAdminSummary = {
  stateId: string;
  slug: string;
  name: string;
  abbreviation: string;
};

type StateAdminAssignment = {
  stateId: string;
  stateSlug: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export async function GET() {
  const supabase = createServerActionClient({ cookies }, {
    supabaseUrl,
    supabaseKey,
  });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      stateAdmins: {
        include: {
          state: {
            select: {
              id: true,
              slug: true,
              name: true,
              code: true,
            },
          },
        },
      },
      producerAdmins: {
        select: { producerId: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  const stateAdminSummaries: StateAdminSummary[] = user.stateAdmins.map((stateAdmin) => ({
    stateId: stateAdmin.stateId,
    slug: stateAdmin.state.slug,
    name: stateAdmin.state.name,
    abbreviation: stateAdmin.state.code,
  }));

  const stateAdminAssignments: StateAdminAssignment[] = user.stateAdmins.map(
    (stateAdmin) => ({
      stateId: stateAdmin.stateId,
      stateSlug: stateAdmin.state.slug,
    }),
  );

  const producerAdminIds = user.producerAdmins.map((producerAdmin) => producerAdmin.producerId);

  const isGlobalAdmin = user.role === "ADMIN";
  const isStateAdmin = stateAdminSummaries.length > 0;
  const isProducerAdmin = producerAdminIds.length > 0;

  return NextResponse.json({
    success: true,
    id: user.id,
    role: user.role,
    username: user.username,
    profilePicUrl: user.profilePicUrl,
    notificationOptIn: user.notificationOptIn,
    isGlobalAdmin,
    isStateAdmin,
    isProducerAdmin,
    adminStates: stateAdminSummaries,
    stateAdminAssignments,
    adminProducers: producerAdminIds,
  });
}

export async function PATCH(request: Request) {
  const supabase = createServerActionClient({ cookies }, {
    supabaseUrl,
    supabaseKey,
  });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 },
    );
  }

  const { profilePicUrl, notificationOptIn } = await request.json();

  const data: { profilePicUrl?: string; notificationOptIn?: boolean } = {};
  if (profilePicUrl !== undefined) data.profilePicUrl = profilePicUrl;
  if (notificationOptIn !== undefined) data.notificationOptIn = notificationOptIn;

  await prisma.user.update({
    where: { email: session.user.email },
    data,
  });

  return NextResponse.json({ success: true });
}
