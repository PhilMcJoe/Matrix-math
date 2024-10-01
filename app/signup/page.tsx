'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
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

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
      const { error: leaderboardError } = await supabase
        .from('leaderboard')
        .insert({ user_id: data.user.id, username: username, score: 0 });

      if (leaderboardError) {
        console.error('Error adding user to leaderboard:', leaderboardError);
        setError('Sign up successful, but there was an error initializing your leaderboard entry.');
      } else {
        setMessage('Sign up successful! Please check your email for verification.');
      }
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono overflow-hidden">
      <MatrixRain />
      <div className="z-10 w-full max-w-md p-8 space-y-8 bg-black bg-opacity-70 rounded-lg shadow-2xl border-2 border-green-500">
        <h1 className="text-4xl font-bold text-center">Join the Matrix</h1>
        {message && <p className="text-green-500 text-center">{message}</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full px-3 py-2 mt-1 text-black bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
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
              placeholder="Choose a password"
              className="w-full px-3 py-2 mt-1 text-black bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-lg font-bold text-black bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="mb-2">Already in the system?</p>
          <Link href="/login">
            <button className="w-full px-4 py-2 text-lg font-bold text-green-500 bg-transparent border-2 border-green-500 rounded-md hover:bg-green-500 hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900">
              Login Here
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}