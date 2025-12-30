import { prisma } from "@/lib/prismadb";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { notFound, redirect } from "next/navigation";
import StrainManager from "@/components/StrainManager";
import { getStateMetadata } from "@/lib/states";
import { getAdminProducerEditTitle, getStaticPageTitle } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ stateName: string; slug: string }>;
}): Promise<Metadata> {
  const { stateName, slug } = await params;
  const state = await getStateMetadata(stateName);

  if (!state) {
    return { title: getStaticPageTitle("stateAdmin") };
  }

  const producer = await prisma.producer.findFirst({
    where: {
      AND: [
        { OR: [{ slug }, { id: slug }] },
        state.producerWhere ?? {},
      ],
    },
    select: { name: true },
  });

  if (!producer) {
    return { title: getStaticPageTitle("stateAdmin") };
  }

  return { title: getAdminProducerEditTitle(producer.name) };
}

export default async function ProducerAdminPage({
  params,
}: {
  params: Promise<{ stateName: string; slug: string }>;
}) {
  const { stateName, slug } = await params;
  const normalizedState = stateName.toLowerCase();

  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    redirect("/login?reason=producer_admin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      producerAdmins: true,
      stateAdmins: {
        include: { state: { select: { id: true, slug: true } } },
      },
    },
  });
  if (!user) redirect("/login");

  const producer = await prisma.producer.findFirst({
    where: {
      AND: [
        { OR: [{ slug }, { id: slug }] },
        { state: { slug: normalizedState } },
      ],
    },
    include: {
      strains: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          releaseDate: true,
          strainSlug: true,
        },
      },
    },
  });
  if (!producer) return notFound();

  const managesProducerByState = user.stateAdmins.some((assignment) => {
    const assignmentSlug = assignment.state?.slug?.toLowerCase();
    return assignment.stateId === producer.stateId || assignmentSlug === normalizedState;
  });

  const isAdmin =
    user.role === "ADMIN" ||
    user.producerAdmins.some((pa) => pa.producerId === producer.id) ||
    managesProducerByState;

  if (!isAdmin) redirect("/");

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Manage Strains - {producer.name}
      </h1>
      <StrainManager
        producerId={producer.id}
        initialStrains={producer.strains}
      />
    </div>
  );
}
