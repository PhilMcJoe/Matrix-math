'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface LeaderboardEntry {
  username: string;
  score: number;
}

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

export default function Dashboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userHighScore, setUserHighScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [showUsernameChange, setShowUsernameChange] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw new Error(userError.message);
      if (!user) throw new Error('No user found');
      
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('leaderboard')
        .select('username, score')
        .order('score', { ascending: false })
        .limit(10);

      if (leaderboardError) throw new Error(`Leaderboard error: ${leaderboardError.message}`);
      
      setLeaderboard(leaderboardData || []);

      const { data: highScoreData, error: highScoreError } = await supabase
        .from('high_scores')
        .select('score')
        .eq('user_id', user.id)
        .single();

      if (highScoreError && highScoreError.code !== 'PGRST116') {
        console.error('High score error:', highScoreError);
      } else {
        setUserHighScore(highScoreData?.score || null);
      }

      const { data: userData, error: usernameError } = await supabase
        .from('leaderboard')
        .select('username')
        .eq('user_id', user.id)
        .single();

      if (usernameError) {
        console.error('Username fetch error:', usernameError);
      } else {
        setCurrentUsername(userData?.username || '');
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const startGame = () => {
    router.push('/game');
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update username in leaderboard table
    const { error: leaderboardError } = await supabase
      .from('leaderboard')
      .update({ username: newUsername })
      .eq('user_id', user.id);

    if (leaderboardError) {
      console.error('Error updating username in leaderboard:', leaderboardError);
      setError('Failed to update username in leaderboard');
      return;
    }

    // Update username in high_scores table
    const { error: highScoreError } = await supabase
      .from('high_scores')
      .update({ username: newUsername })
      .eq('user_id', user.id);

    if (highScoreError) {
      console.error('Error updating username in high_scores:', highScoreError);
      setError('Failed to update username in high scores');
      return;
    }

    // If both updates were successful
    setCurrentUsername(newUsername);
    setShowUsernameChange(false);
    setNewUsername('');
    fetchData(); // Refresh the leaderboard and user data
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    } else {
      router.push('/');
    }
  };

  if (loading) {
    return <div className="text-green-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono overflow-hidden">
      <MatrixRain />
      <div className="z-10 w-full max-w-4xl p-8 space-y-8 bg-black bg-opacity-70 rounded-lg shadow-2xl border-2 border-green-500">
        <h1 className="text-4xl font-bold mb-8 text-center">Matrix Math Challenge Dashboard</h1>
        
        {/* Leaderboard section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Leaderboard</h2>
          {leaderboard.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-green-500">
                    <th className="px-2 py-1 text-left w-16">Rank</th>
                    <th className="px-2 py-1 text-left">User</th>
                    <th className="px-2 py-1 text-right w-24">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr key={index} className="border-b border-green-500 border-opacity-50">
                      <td className="px-2 py-1 w-16">{index + 1}</td>
                      <td className="px-2 py-1">
                        <div className="truncate max-w-[200px]">{entry.username}</div>
                      </td>
                      <td className="px-2 py-1 text-right w-24">{entry.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center">No leaderboard data available.</p>
          )}
        </div>

        {/* Username section */}
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Your Username: {currentUsername}</h2>
        </div>

        {/* High Score section */}
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Your High Score: {userHighScore !== null ? userHighScore : 'No high score yet'}</h2>
        </div>

        {/* Change Username and Sign Out section */}
        <div className="mb-8 text-center">
          <div className="flex justify-center space-x-4">
            {!showUsernameChange ? (
              <button
                onClick={() => setShowUsernameChange(true)}
                className="px-4 py-2 text-sm font-bold text-green-500 bg-black border border-green-500 rounded hover:bg-green-500 hover:text-black transition-colors"
              >
                Change Username
              </button>
            ) : (
              <form onSubmit={handleUsernameChange} className="flex items-center">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="New username"
                  className="px-2 py-1 text-black rounded mr-2"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold text-green-500 bg-black border border-green-500 rounded hover:bg-green-500 hover:text-black transition-colors"
                >
                  Update
                </button>
              </form>
            )}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-bold text-green-500 bg-black border border-green-500 rounded hover:bg-green-500 hover:text-black transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Rules section */}
        <div className="text-sm max-w-md text-center mb-6 mx-auto">
          <p><span className="font-bold text-red-500">Rules:</span> Answer math questions as fast as you can.</p>
          <p>Every correct answer adds 1 second to the timer.</p>
          <p>Every incorrect answer removes 5 seconds from the timer.</p>
          <p>Good luck!</p>
        </div>

        {/* Start Game button */}
        <div className="text-center">
          <button
            onClick={startGame}
            className="px-6 py-3 text-lg font-bold text-black bg-green-500 rounded hover:bg-green-600 transition-colors"
          >
            Start New Game
          </button>
        </div>
      </div>
    </div>
  );
}