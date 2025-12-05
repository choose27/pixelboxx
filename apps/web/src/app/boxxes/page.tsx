'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Boxx {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  memberCount: number;
  owner: {
    username: string;
  };
}

export default function BoxxBrowserPage() {
  const router = useRouter();
  const [boxxes, setBoxxes] = useState<Boxx[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newBoxxName, setNewBoxxName] = useState('');
  const [newBoxxDescription, setNewBoxxDescription] = useState('');

  useEffect(() => {
    fetchBoxxes();
  }, []);

  const fetchBoxxes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/boxxes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setBoxxes(data);
    } catch (error) {
      console.error('Failed to fetch boxxes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBoxx = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/boxxes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newBoxxName,
          description: newBoxxDescription,
        }),
      });

      const data = await res.json();
      router.push(`/boxxes/${data.slug}`);
    } catch (error) {
      console.error('Failed to create boxx:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Discover Boxxes</h1>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Create Boxx
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boxxes.map((boxx) => (
            <Link
              key={boxx.id}
              href={`/boxxes/${boxx.slug}`}
              className="block rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                {boxx.iconUrl ? (
                  <img
                    src={boxx.iconUrl}
                    alt={boxx.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-2xl font-bold text-white">
                    {boxx.name[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-gray-900 truncate">
                    {boxx.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {boxx.memberCount} member{boxx.memberCount !== 1 ? 's' : ''}
                  </p>
                  {boxx.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {boxx.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {boxxes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No public boxxes found.</p>
            <p className="text-gray-400 mt-2">Create one to get started!</p>
          </div>
        )}
      </div>

      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">Create a Boxx</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={newBoxxName}
                  onChange={(e) => setNewBoxxName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="My Awesome Community"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newBoxxDescription}
                  onChange={(e) => setNewBoxxDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="What's your boxx about?"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createBoxx}
                  disabled={!newBoxxName.trim()}
                  className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-300"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
