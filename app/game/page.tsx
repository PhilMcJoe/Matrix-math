'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import MathGame from '../components/MathGame';

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    const fontSize = 16;
    const columns = canvas.width / fontSize;

    const rainDrops: number[] = Array(Math.floor(columns)).fill(canvas.height);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        const x = i * fontSize;
        const y = rainDrops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    };

    const interval = setInterval(draw, 85);

    return () => clearInterval(interval);
  }, [dimensions]);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full" />;
};

export default function GamePage() {
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

  if (loading) {
    return <div className="text-green-500">Loading...</div>;
  }

  return (
    <div className="relative min-h-screen bg-black">
      <MatrixRain />
      <div className="relative z-10">
        <MathGame />
      </div>
    </div>
  );
}