'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

type Operation = '+' | '-' | '*' | '/';

interface Question {
  num1: number;
  num2: number;
  operation: Operation;
}


export default function MathGame() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timer, setTimer] = useState(30.0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [username, setUsername] = useState('');
  const [leaderboardThreshold, setLeaderboardThreshold] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchHighScore();
    fetchLeaderboardThreshold();
    startNewGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const fetchHighScore = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data, error } = await supabase
      .from('high_scores')
      .select('score')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching high score:', error);
    } else if (data) {
      setHighScore(data.score);
    }
  };

  const fetchLeaderboardThreshold = async () => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('score')
      .order('score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching leaderboard threshold:', error);
    } else if (data && data.length === 10) {
      setLeaderboardThreshold(data[9].score);
    }
  };

  const startNewGame = () => {
    setScore(0);
    setTimer(30.0);
    setGameOver(false);
    setAnswer('');
    generateQuestion();
    inputRef.current?.focus();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 0) {
          clearInterval(timerRef.current!);
          setGameOver(true);
          return 0;
        }
        return prevTimer - 0.1;
      });
    }, 100);
  };

  const generateQuestion = () => {
    const operations: Operation[] = ['+', '-', '*', '/'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;

    if (operation === '/') {
      num1 = num2 * (Math.floor(Math.random() * 10) + 1);
    }

    setQuestion({ num1, num2, operation });
  };

  const checkAnswer = () => {
    if (!question) return;

    const correctAnswer = eval(`${question.num1} ${question.operation} ${question.num2}`);
    if (parseFloat(answer) === correctAnswer) {
      setScore(score + 1);
      setTimer((prevTimer) => prevTimer + 1.0);
      setAnswer('');
      generateQuestion();
    } else {
      setTimer((prevTimer) => prevTimer - 5.0);
      setAnswer('');
      generateQuestion();
    }
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const updateHighScore = async (newScore: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('Updating high score for user:', user.id);
      
      // Fetch the current username and high score from the leaderboard
      const { data: userData, error: usernameError } = await supabase
        .from('leaderboard')
        .select('username, score')
        .eq('user_id', user.id)
        .single();

      if (usernameError) {
        console.error('Error fetching user data:', usernameError);
        return;
      }

      const currentUsername = userData?.username || user.email;
      const currentHighScore = userData?.score || 0;

      // Only update if the new score is higher
      if (newScore > currentHighScore) {
        // Update high_scores table
        const { error: highScoreError } = await supabase
          .from('high_scores')
          .upsert({ user_id: user.id, score: newScore }, { onConflict: 'user_id' });

        if (highScoreError) {
          console.error('Error updating high score:', highScoreError);
        }

        // Update leaderboard table
        const { error: leaderboardError } = await supabase
          .from('leaderboard')
          .upsert({ user_id: user.id, username: currentUsername, score: newScore }, { onConflict: 'user_id' });

        if (leaderboardError) {
          console.error('Error updating leaderboard:', leaderboardError);
        }

        console.log('High score updated to:', newScore);
      } else {
        console.log('Score not high enough to update:', newScore);
      }
    }
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateHighScore(score);
    setShowUsernamePrompt(false);
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  if (showUsernamePrompt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono">
        <div className="bg-black bg-opacity-70 p-8 rounded-lg border-2 border-green-500 w-11/12 max-w-2xl text-center">
          <h1 className="text-4xl mb-4">New High Score!</h1>
          <p className="text-2xl mb-4">Your score: {score}</p>
          <form onSubmit={handleUsernameSubmit} className="flex flex-col items-center">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="px-4 py-2 text-xl text-black bg-green-200 rounded mb-4 w-full"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 text-lg font-bold text-black bg-green-500 rounded hover:bg-green-600 transition-colors w-full"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono">
        <div className="bg-black bg-opacity-70 p-8 rounded-lg border-2 border-green-500 w-11/12 max-w-[64rem] text-center">
          <h1 className="text-4xl mb-6 text-red-500">Game Over</h1>
          <p className="text-2xl mb-4">Final Score: {score}</p>
          <p className="text-xl mb-6">High Score: {highScore}</p>
          <div className="flex flex-col space-y-4">
            <button
              onClick={startNewGame}
              className="px-6 py-3 text-lg font-bold text-black bg-green-500 rounded hover:bg-green-600 transition-colors w-full"
            >
              Play Again
            </button>
            <button
              onClick={goToDashboard}
              className="px-6 py-3 text-lg font-bold text-green-500 bg-transparent border-2 border-green-500 rounded hover:bg-green-500 hover:text-black transition-colors w-full"
            >
              View Leaderboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono">
      <div className="bg-black bg-opacity-70 p-8 rounded-lg border-2 border-green-500 w-11/12 max-w-2xl text-center">
        <h1 className="text-4xl mb-6">Matrix Math Challenge</h1>
        <div className="flex justify-between mb-6">
          <p className="text-2xl">Score: {score}</p>
          <p className="text-2xl">High Score: {highScore}</p>
        </div>
        <p className="text-3xl mb-6">Time: {timer.toFixed(1)}</p>
        {question && (
          <div className="text-4xl mb-6">
            {question.num1} {question.operation} {question.num2} = ?
          </div>
        )}
        <input
          ref={inputRef}
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          className="px-4 py-2 text-2xl text-black bg-green-200 rounded mb-4 w-full text-center"
          placeholder="Enter your answer"
        />
      </div>
    </div>
  );
}