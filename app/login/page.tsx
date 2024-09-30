'use client';
import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/game');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-lg shadow-2xl">
        <h1 className="text-4xl font-bold text-center">Login to the Matrix</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 mt-1 text-black bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 mt-1 text-black bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-lg font-bold text-black bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Jack In
          </button>
        </form>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        <div className="mt-6 text-center">
          <p className="mb-2">Not in the system?</p>
          <Link href="/signup">
            <button className="w-full px-4 py-2 text-lg font-bold text-green-500 bg-transparent border-2 border-green-500 rounded-md hover:bg-green-500 hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900">
              Sign Up Here
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}