'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow border p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <button
              onClick={logout}
              className="bg-red-50 text-red-600 px-4 py-2 rounded hover:bg-red-100"
            >
              Logout
            </button>
          </div>

          <div className="bg-blue-50 text-blue-800 p-4 rounded mb-6">
            <h2 className="text-lg font-semibold mb-2">Welcome back, {user?.first_name || user?.email}!</h2>
            <p>You are successfully authenticated and viewing a protected route.</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Your Profile Details:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
