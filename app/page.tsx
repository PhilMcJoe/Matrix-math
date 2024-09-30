'use client';

import React from 'react';
import Link from 'next/link';

const MatrixRain = () => {
  // ... (keep the existing MatrixRain component)
};

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono overflow-hidden">
      <MatrixRain />
      <div className="z-10 text-center">
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
      <div className="absolute bottom-4 text-sm text-green-700">
        <p>"There is no spoon." - The Matrix</p>
      </div>
    </div>
  );
}
