import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { getSupabaseCookieContext } from "@/lib/supabaseCookieContext";
import { getVerifiedAuth } from "@/lib/supabaseAuth";

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
  const { cookieContext } = await getSupabaseCookieContext();
  const supabase = createServerActionClient(
    cookieContext,
    {
      supabaseUrl,
      supabaseKey,
    }
  );
  const { user: supabaseUser } = await getVerifiedAuth(supabase);

  if (!supabaseUser?.email) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const prismaUser = await prisma.user.findUnique({
    where: { email: supabaseUser.email },
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

  if (!prismaUser) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  const stateAdminSummaries: StateAdminSummary[] = prismaUser.stateAdmins.map((stateAdmin) => ({
    stateId: stateAdmin.stateId,
    slug: stateAdmin.state.slug,
    name: stateAdmin.state.name,
    abbreviation: stateAdmin.state.code,
  }));

  const stateAdminAssignments: StateAdminAssignment[] = prismaUser.stateAdmins.map(
    (stateAdmin) => ({
      stateId: stateAdmin.stateId,
      stateSlug: stateAdmin.state.slug,
    }),
  );

  const producerAdminIds = prismaUser.producerAdmins.map((producerAdmin) => producerAdmin.producerId);

  const isGlobalAdmin = prismaUser.role === "ADMIN";
  const isStateAdmin = stateAdminSummaries.length > 0;
  const isProducerAdmin = producerAdminIds.length > 0;

  return NextResponse.json({
    success: true,
    id: prismaUser.id,
    role: prismaUser.role,
    username: prismaUser.username,
    profilePicUrl: prismaUser.profilePicUrl,
    notificationOptIn: prismaUser.notificationOptIn,
    isGlobalAdmin,
    isStateAdmin,
    isProducerAdmin,
    adminStates: stateAdminSummaries,
    stateAdminAssignments,
    adminProducers: producerAdminIds,
  });
}

export async function PATCH(request: Request) {
  const { cookieContext } = await getSupabaseCookieContext();
  const supabase = createServerActionClient(
    cookieContext,
    {
      supabaseUrl,
      supabaseKey,
    }
  );
  const { user: supabaseUser } = await getVerifiedAuth(supabase);

  if (!supabaseUser?.email) {
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
    where: { email: supabaseUser.email },
    data,
  });

  return NextResponse.json({ success: true });
}
