'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { agentService, Agent } from '../../../../../services/agent';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AgentDetails() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;
  const agentId = params.agentId as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    default_language: '',
    system_prompt: '',
    is_active: true
  });

  useEffect(() => {
    if (!orgId || !agentId) return;

    const fetchAgent = async () => {
      try {
        const data = await agentService.getAgent(orgId, agentId);
        setAgent(data);
        setEditForm({
          name: data.name,
          description: data.description || '',
          default_language: data.default_language || 'en-US',
          system_prompt: data.system_prompt || '',
          is_active: data.is_active ?? true
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load agent details');
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [orgId, agentId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;

    setSaving(true);
    setError('');

    try {
      const updated = await agentService.updateAgent(orgId, agentId, editForm);
      setAgent(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update agent');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!agent) return;
    try {
      const updated = await agentService.updateAgent(orgId, agentId, { is_active: !agent.is_active });
      setAgent(updated);
      setEditForm(prev => ({ ...prev, is_active: updated.is_active ?? true }));
    } catch (err: any) {
      setError(err.message || 'Failed to change status');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-8 max-w-4xl mx-auto text-center">Loading Agent...</div>
      </ProtectedRoute>
    );
  }

  if (!agent) {
    return (
      <ProtectedRoute>
        <div className="p-8 max-w-4xl mx-auto text-center text-red-600">Agent not found or you don't have access.</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-4xl mx-auto">
        <Link href={`/organizations/${orgId}/agents`} className="text-sm text-blue-600 hover:underline mb-6 inline-block">
          &larr; Back to Agents
        </Link>
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              {agent.name}
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                agent.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {agent.is_active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </h1>
            <p className="text-sm text-gray-500 font-mono">ID: {agent.id}</p>
          </div>
          
          {!isEditing && (
            <div className="flex gap-3">
              <button
                onClick={handleToggleStatus}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50 font-medium"
              >
                {agent.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
              >
                Edit Configuration
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleUpdate} className="bg-white p-6 border rounded-lg shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name *</label>
              <input
                type="text"
                value={editForm.name}
                onChange={e => setEditForm({...editForm, name: e.target.value})}
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editForm.description}
                onChange={e => setEditForm({...editForm, description: e.target.value})}
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
              <select
                value={editForm.default_language}
                onChange={e => setEditForm({...editForm, default_language: e.target.value})}
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
              <textarea
                value={editForm.system_prompt}
                onChange={e => setEditForm({...editForm, system_prompt: e.target.value})}
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={8}
              />
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50 text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 border rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">System Prompt</h2>
                {agent.system_prompt ? (
                  <pre className="bg-gray-50 p-4 rounded text-sm font-mono text-gray-700 whitespace-pre-wrap overflow-x-auto">
                    {agent.system_prompt}
                  </pre>
                ) : (
                  <p className="text-gray-500 italic">No system prompt configured.</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 border rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Language</h3>
                    <p className="mt-1 font-medium">{agent.default_language}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Description</h3>
                    <p className="mt-1 text-sm text-gray-700">
                      {agent.description || <span className="italic text-gray-400">None</span>}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Created</h3>
                    <p className="mt-1 text-sm text-gray-700">
                      {new Date(agent.created_at).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Last Updated</h3>
                    <p className="mt-1 text-sm text-gray-700">
                      {new Date(agent.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 border rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Future Integrations</h2>
                <ul className="text-sm text-gray-500 space-y-3">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    Voice Configuration (Pending)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    Knowledge Base (Pending)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    LLM Provider (Pending)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
