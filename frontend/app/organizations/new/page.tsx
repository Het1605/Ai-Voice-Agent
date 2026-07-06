'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { organizationService } from '../../../services/organization';

export default function CreateOrganization() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Organization name is required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await organizationService.createOrganization({ name });
      router.push('/organizations');
    } catch (err: any) {
      setError(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white border rounded shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Create Organization</h1>
      
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Organization Name
          </label>
          <input
            id="name"
            type="text"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Corp"
            disabled={loading}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={() => router.push('/organizations')}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Organization'}
          </button>
        </div>
      </form>
    </div>
  );
}
