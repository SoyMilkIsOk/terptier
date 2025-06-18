// src/app/admin/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import AddProducerForm from "@/components/AddProducerForm";
import { prisma } from "@/lib/prismadb";

export default async function AdminPage() {
  // getSession auto‐reads your HTTP-only Supabase cookie
  const {
    data: { session },
  } = await supabaseServer.auth.getSession();

  // redirect if no session or not your admin email
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    return redirect("/login");
  }

  // now that we’re authenticated, fetch & render
  const producers = await prisma.producer.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl mb-4">Admin Panel</h1>
      <AddProducerForm />
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Category</th>
          </tr>
        </thead>
        <tbody>
          {producers.map((p) => (
            <tr key={p.id}>
              <td className="border px-4 py-2">{p.name}</td>
              <td className="border px-4 py-2">{p.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
