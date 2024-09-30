'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const MatrixRain = () => {
  const [rain, setRain] = useState<string[]>([]);

  useEffect(() => {
    const characters = '01';
    const columns = Math.floor(window.innerWidth / 20);
    const initialRain = Array(columns).fill('');

    const interval = setInterval(() => {
      setRain(prevRain => 
        prevRain.map(col => 
          (Math.random() > 0.9 ? characters[Math.floor(Math.random() * characters.length)] : '') + col.slice(0, 25)
        )
      );
    }, 100);

    setRain(initialRain);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 text-green-500 opacity-20 z-0 overflow-hidden">
      {rain.map((col, i) => (
        <div key={i} className="absolute top-0 text-xs" style={{ left: `${i * 20}px` }}>
          {col}
        </div>
      ))}
    </div>
  );
};

export default function ProtectedPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router, supabase]);

  const startGame = () => {
    router.push('/game');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono overflow-hidden">
      <MatrixRain />
      <div className="z-10 text-center">
        <h1 className="text-6xl font-bold mb-8 animate-pulse">Welcome to the Matrix</h1>
        <p className="text-xl mb-8">Are you ready to test your math skills?</p>
        <button
          onClick={startGame}
          className="px-8 py-4 text-2xl font-bold text-black bg-green-500 rounded-lg hover:bg-green-600 transition-colors transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          Start Game
        </button>
      </div>
      <button
        onClick={handleSignOut}
        className="absolute top-4 right-4 text-green-500 hover:text-green-400"
      >
        Sign Out
      </button>
    </div>
  );
}
