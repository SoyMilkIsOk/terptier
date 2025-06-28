// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddProducerForm from "@/components/AddProducerForm";
import Modal from "@/components/Modal";
import type { Producer } from "@prisma/client";
import { XCircle } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [producers, setProducers] = useState<Producer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmData, setConfirmData] = useState<{id: string, name: string} | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<Producer | null>(null);

  useEffect(() => {
    const fetchProducers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/producers');
        if (!response.ok) {
          throw new Error(`Failed to fetch producers: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        const combinedProducers = [...(data.flower || []), ...(data.hash || [])].sort(
          (a, b) => {
            const typeCompare = (a.category || '').localeCompare(b.category || '');
            if (typeCompare !== 0) return typeCompare;
            const nameA = a.name || '';
            const nameB = b.name || '';
            return nameA.localeCompare(nameB);
          }
        );
        setProducers(combinedProducers);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching producers for admin panel:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const run = async () => {
      const res = await fetch('/api/users/me');
      const data = await res.json();
      if (!data.success || data.role !== 'ADMIN') {
        router.push('/');
        return;
      }
      await fetchProducers();
    };
    run();
  }, []);

  const handleDelete = (producerId: string, producerName: string) => {
    setConfirmData({ id: producerId, name: producerName });
  };

  const handleEdit = (producer: Producer) => {
    setEditing(producer);
  };

  const confirmDelete = async () => {
    if (!confirmData) return;
    try {
      const response = await fetch(`/api/producers/${confirmData.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        setProducers(producers.filter((p) => p.id !== confirmData.id));
        setMessage(`Producer "${confirmData.name}" deleted successfully.`);
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to delete producer. Unknown error." }));
        setMessage(`Failed to delete producer: ${errorData.message || response.statusText}`);
      }
    } catch (err: any) {
      setMessage(`An error occurred: ${err.message}`);
      console.error("Error during delete operation:", err);
    } finally {
      setConfirmData(null);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading producers...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error loading producers: {error}</div>;
  }

  // Main return - Reconstructed JSX starts here
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8"> {/* Using container class from prompt example */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Panel</h1>

      <div className="mb-8 p-6 bg-white shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Producer</h2>
        <AddProducerForm />
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        {producers.length === 0 && !isLoading ? ( // Ensure !isLoading is also checked here
          <p className="p-6 text-center text-gray-500">No producers found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {producers.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{p.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      p.category === 'FLOWER' ? 'bg-green-100 text-green-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {p.category || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name || 'this producer')}
                      className="text-red-600 hover:text-red-800 transition-colors duration-150"
                      aria-label={`Delete ${p.name || 'this producer'}`}
                      title={`Delete ${p.name || 'this producer'}`}
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
      {confirmData && (
        <Modal isOpen={true} onClose={() => setConfirmData(null)}>
          <p className="mb-4">Are you sure you want to delete "{confirmData.name}"? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setConfirmData(null)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
      {editing && (
        <Modal isOpen={true} onClose={() => setEditing(null)}>
          <AddProducerForm producer={editing} onSaved={() => { setEditing(null); window.location.reload(); }} />
        </Modal>
      )}
      {message && (
        <Modal isOpen={true} onClose={() => setMessage(null)}>
          <p className="mb-4">{message}</p>
        </Modal>
      )}
    </div>
  );
}
