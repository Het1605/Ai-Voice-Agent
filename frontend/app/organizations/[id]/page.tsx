'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { organizationService, Organization, OrganizationMember } from '../../../services/organization';

export default function OrganizationDetails() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;
  
  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!orgId) return;

    const fetchData = async () => {
      try {
        const [orgData, membersData] = await Promise.all([
          organizationService.getOrganization(orgId),
          organizationService.getOrganizationMembers(orgId)
        ]);
        setOrg(orgData);
        setEditName(orgData.name);
        setMembers(membersData);
      } catch (err: any) {
        setError(err.message || 'Failed to load organization details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orgId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setSaving(true);
    try {
      const updatedOrg = await organizationService.updateOrganization(orgId, { name: editName });
      setOrg(updatedOrg);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update organization');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading details...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!org) return <div className="p-8 text-center">Organization not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-4">
        <Link href="/organizations" className="text-blue-600 hover:underline text-sm">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white p-6 border rounded shadow-sm mb-8">
        <div className="flex justify-between items-start mb-4">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="flex flex-col gap-2 w-full max-w-md">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                disabled={saving}
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setEditName(org.name); }}
                  className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                {org.name}
                {!org.is_active && (
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full font-normal">
                    Inactive
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-1">ID: {org.id}</p>
            </div>
          )}

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Edit Settings
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 border rounded shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Members ({members.length})</h2>
          
          {members.length === 0 ? (
            <div className="p-4 bg-gray-50 text-center text-gray-500 rounded">
              No members found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 font-medium text-gray-600">User ID</th>
                    <th className="py-3 px-4 font-medium text-gray-600">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm text-gray-600">{member.user_id.substring(0, 8)}...</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          member.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                          member.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {member.role.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white p-6 border rounded shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-4">AI Agents</h2>
            <p className="text-gray-600 mb-6">
              Configure and manage AI voice agents for this organization.
            </p>
          </div>
          <Link 
            href={`/organizations/${org.id}/agents`}
            className="block text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Manage Agents &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
