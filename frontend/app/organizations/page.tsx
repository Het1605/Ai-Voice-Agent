'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { organizationService, OrganizationMember } from '../../services/organization';
import { useAuth } from '../../contexts/AuthContext';

export default function OrganizationsDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const fetchOrgs = async () => {
      try {
        const data = await organizationService.getMyOrganizations();
        setMemberships(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch organizations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrgs();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center">Loading organizations...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Organizations</h1>
        <Link href="/organizations/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Create Organization
        </Link>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">
          {error}
        </div>
      )}

      {memberships.length === 0 && !error ? (
        <div className="p-8 text-center bg-gray-50 border rounded text-gray-500">
          You don't belong to any organizations yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {memberships.map((membership) => (
            <div key={membership.id} className="p-6 border rounded shadow-sm bg-white flex flex-col">
              <h2 className="text-xl font-semibold mb-2">
                {membership.organization?.name || 'Unknown Organization'}
              </h2>
              <div className="text-sm text-gray-600 mb-4">
                Role: <span className="uppercase font-medium">{membership.role}</span>
              </div>
              <div className="mt-auto pt-4 flex gap-2">
                <button 
                  onClick={() => router.push(`/organizations/${membership.organization_id}`)}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
