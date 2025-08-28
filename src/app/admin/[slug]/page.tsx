import { prisma } from "@/lib/prismadb";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { notFound, redirect } from "next/navigation";
import StrainManager from "@/components/StrainManager";

export const dynamic = "force-dynamic";

export default async function ProducerAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    redirect("/login?reason=producer_admin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { producerAdmins: true },
  });
  if (!user) redirect("/login");

  const producer = await prisma.producer.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: {
      strains: {
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

  const isAdmin =
    user.role === "ADMIN" ||
    user.producerAdmins.some((pa) => pa.producerId === producer.id);
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
