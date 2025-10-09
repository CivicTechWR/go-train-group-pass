'use client';

import { trpc } from '@/lib/trpc/client';
import { useEffect, useState } from 'react';

export default function TestTRPCPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testQuery = async () => {
      try {
        console.log('Testing tRPC query...');
        const result = await fetch('/api/trpc/trips.list?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22startDate%22%3A%222025-10-09%22%2C%22endDate%22%3A%222025-10-09%22%7D%7D%7D');
        const json = await result.json();
        console.log('Raw API response:', json);
        setData(json);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    testQuery();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">tRPC Test</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
