'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { agentService, Agent } from '../../../../services/agent';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AgentList() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orgId) return;

    const fetchAgents = async () => {
      try {
        const data = await agentService.listAgents(orgId);
        setAgents(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load agents');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [orgId]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-8 max-w-6xl mx-auto text-center">Loading Agents...</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href={`/organizations/${orgId}`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
              &larr; Back to Organization
            </Link>
            <h1 className="text-3xl font-bold">AI Agents</h1>
          </div>
          <Link 
            href={`/organizations/${orgId}/agents/new`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            + Create Agent
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        {agents.length === 0 ? (
          <div className="bg-white p-10 text-center border rounded shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first AI voice agent.</p>
            <Link 
              href={`/organizations/${orgId}/agents/new`}
              className="text-blue-600 font-medium hover:underline"
            >
              Create an Agent
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map(agent => (
              <div key={agent.id} className="bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 truncate pr-2">{agent.name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    agent.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {agent.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-6 h-10 overflow-hidden line-clamp-2">
                  {agent.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-xs text-gray-500 font-mono">
                    Lang: {agent.default_language}
                  </span>
                  <Link 
                    href={`/organizations/${orgId}/agents/${agent.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Manage &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
