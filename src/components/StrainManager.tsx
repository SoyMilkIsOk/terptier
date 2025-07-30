"use client";
import { useState } from "react";
import type { Strain } from "@prisma/client";
import Modal from "./Modal";
import AddStrainForm from "./AddStrainForm";
import { XCircle, FilePenLine } from "lucide-react";

export default function StrainManager({
  producerId,
  initialStrains,
}: {
  producerId: string;
  initialStrains: Strain[];
}) {
  const [strains, setStrains] = useState<Strain[]>(initialStrains);
  const [editing, setEditing] = useState<Strain | null>(null);

  const refresh = async () => {
    const res = await fetch(`/api/strains?producerId=${producerId}`, {
      credentials: "include",
    });
    const data = await res.json();
    if (data.success) setStrains(data.strains);
  };

  const deleteStrain = async (id: string) => {
    await fetch(`/api/strains/${id}`, { method: "DELETE", credentials: "include" });
    setStrains(strains.filter((s) => s.id !== id));
  };

  return (
    <div>
      <div className="mb-8 p-6 bg-white shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Add Strain</h2>
        <AddStrainForm producerId={producerId} onSaved={refresh} />
      </div>
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        {strains.length === 0 ? (
          <p className="p-6 text-center text-gray-500">No strains found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Release
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {strains.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{s.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {s.releaseDate
                      ? new Date(s.releaseDate).toISOString().slice(0, 10)
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => setEditing(s)}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label={`Edit ${s.name}`}
                    >
                      <FilePenLine size={20} />
                    </button>
                    <button
                      onClick={() => deleteStrain(s.id)}
                      className="text-red-600 hover:text-red-800"
                      aria-label={`Delete ${s.name}`}
                    >
                      <XCircle size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {editing && (
        <Modal isOpen={true} onClose={() => setEditing(null)}>
          <AddStrainForm
            producerId={producerId}
            strain={editing}
            onSaved={() => {
              setEditing(null);
              refresh();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
