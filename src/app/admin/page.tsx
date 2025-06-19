// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddProducerForm from "@/components/AddProducerForm";
import type { Producer } from "@prisma/client";
import { XCircle } from "lucide-react";
import Image from "next/image"; // Added import for Image component

export default function AdminPage() {
  const router = useRouter();
  const [producers, setProducers] = useState<Producer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const combinedProducers = [...(data.flower || []), ...(data.hash || [])].sort((a, b) => {
          const nameA = a.name || '';
          const nameB = b.name || '';
          return nameA.localeCompare(nameB);
        });
        setProducers(combinedProducers);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching producers for admin panel:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducers();
  }, []);

  const handleDelete = async (producerId: string, producerName: string) => {
    if (window.confirm(`Are you sure you want to delete "${producerName}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/producers/${producerId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert(`Producer "${producerName}" deleted successfully.`);
          router.refresh();
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Failed to delete producer. Unknown error.' }));
          alert(`Failed to delete producer: ${errorData.message || response.statusText}`);
        }
      } catch (err: any) {
        alert(`An error occurred: ${err.message}`);
        console.error("Error during delete operation:", err);
      }
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {producers.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {p.logoUrl ? (
                      <Image src={p.logoUrl} alt={`${p.name || 'Producer'} logo`} width={40} height={40} className="object-contain rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">No Logo</div>
                    )}
                  </td>
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
    </div>
  );
}
