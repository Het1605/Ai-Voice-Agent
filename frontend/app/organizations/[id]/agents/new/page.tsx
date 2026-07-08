'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { agentService } from '../../../../../services/agent';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function CreateAgent() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultLanguage, setDefaultLanguage] = useState('en-US');
  const [systemPrompt, setSystemPrompt] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Agent name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await agentService.createAgent(orgId, {
        name,
        description,
        default_language: defaultLanguage,
        system_prompt: systemPrompt,
        is_active: true
      });
      router.push(`/organizations/${orgId}/agents`);
    } catch (err: any) {
      setError(err.message || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-2xl mx-auto">
        <Link href={`/organizations/${orgId}/agents`} className="text-sm text-blue-600 hover:underline mb-6 inline-block">
          &larr; Back to Agents
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Create New AI Agent</h1>

        {error && (
          <div className="mb-6 p-4 text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 border rounded-lg shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Customer Support Bot"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What does this agent do?"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
            <select
              value={defaultLanguage}
              onChange={e => setDefaultLanguage(e.target.value)}
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
            <p className="text-xs text-gray-500 mb-2">The core persona and instructions for this agent.</p>
            <textarea
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="You are a helpful customer support agent..."
              rows={6}
            />
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <Link 
              href={`/organizations/${orgId}/agents`}
              className="px-4 py-2 border rounded hover:bg-gray-50 text-gray-700 font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium disabled:opacity-70"
            >
              {loading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
