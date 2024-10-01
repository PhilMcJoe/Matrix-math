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
        router.push('/dashboard');  // Redirect to dashboard instead of showing content
      }
    };
    checkUser();
  }, [router, supabase]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return null;  // This component no longer renders anything
}
