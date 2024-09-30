'use client';
import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push('/game');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono">
      <h1 className="text-4xl mb-8">Sign Up</h1>
      <form onSubmit={handleSignUp} className="flex flex-col items-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="mb-4 p-2 text-black"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mb-4 p-2 text-black"
          required
        />
        <button type="submit" className="px-6 py-3 text-lg font-bold text-black bg-green-500 rounded hover:bg-green-600 transition-colors">
          Sign Up
        </button>
      </form>
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}