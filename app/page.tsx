'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

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

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono overflow-hidden">
      <MatrixRain />
      <div className="z-10 text-center bg-black bg-opacity-70 p-8 rounded-lg border-2 border-green-500">
        <h1 className="text-6xl font-bold mb-4 animate-pulse">Matrix Math Challenge</h1>
        <p className="text-xl mb-8">Enter the Matrix. Test your math skills.</p>
        <div className="flex flex-col items-center space-y-4">
          <Link href="/login">
            <button className="w-48 px-6 py-3 text-lg font-bold text-black bg-green-500 rounded hover:bg-green-600 transition-colors transform hover:scale-105">
              Login
            </button>
          </Link>
          <Link href="/signup">
            <button className="w-48 px-6 py-3 text-lg font-bold text-green-500 bg-transparent border-2 border-green-500 rounded hover:bg-green-500 hover:text-black transition-colors transform hover:scale-105">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
      <div className="absolute bottom-4 text-sm text-green-700 bg-black bg-opacity-70 px-4 py-2 rounded border border-green-500">
        <p>"There is no spoon." - The Matrix</p>
      </div>
    </div>
  );
}
