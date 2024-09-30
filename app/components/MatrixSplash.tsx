'use client';

import React from 'react';
import Link from 'next/link';

export default function MatrixSplash() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono">
      <h1 className="text-6xl mb-8">Matrix Math Challenge</h1>
      <div className="flex space-x-4">
        <Link href="/signup">
          <button className="px-6 py-3 text-lg font-bold text-black bg-green-500 rounded hover:bg-green-600 transition-colors">
            Sign Up
          </button>
        </Link>
        <Link href="/login">
          <button className="px-6 py-3 text-lg font-bold text-black bg-green-500 rounded hover:bg-green-600 transition-colors">
            Login
          </button>
        </Link>
      </div>
    </div>
  );
}