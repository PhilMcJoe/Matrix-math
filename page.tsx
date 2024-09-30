'use client';
import React, { useState, useEffect, useRef } from 'react';

type Operation = '+' | '-' | '*' | '/';

interface Question {
  num1: number;
  num2: number;
  operation: Operation;
}

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [chances, setChances] = useState(3);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (gameStarted) {
      generateQuestion();
      inputRef.current?.focus();
    }
  }, [gameStarted]);

  const checkAnswer = () => {
    if (!question) return;

    const correctAnswer = eval(`${question.num1} ${question.operation} ${question.num2}`);
    if (parseFloat(answer) === correctAnswer) {
      setScore(score + 1);
      setAnswer('');
      generateQuestion();
    } else {
      setChances(chances - 1);
      if (chances === 1) {
        setGameOver(true);
      } else {
        setAnswer('');
        generateQuestion();
      }
    }
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const resetGame = () => {
    setScore(0);
    setChances(3);
    setGameOver(false);
    setAnswer('');
    setGameStarted(false);
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono">
        <h1 className="text-6xl mb-8">Matrix Math Challenge</h1>
        <button
          onClick={() => setGameStarted(true)}
          className="px-6 py-3 text-lg font-bold text-black bg-green-500 rounded hover:bg-green-600 transition-colors"
        >
          Enter the Matrix
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono">
        <h1 className="text-4xl mb-4">Game Over</h1>
        <p className="text-2xl mb-4">Final Score: {score}</p>
        <button
          onClick={resetGame}
          className="px-6 py-3 text-lg font-bold text-black bg-green-500 rounded hover:bg-green-600 transition-colors"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono">
      <h1 className="text-4xl mb-4">Matrix Math Challenge</h1>
      <p className="text-2xl mb-4">Score: {score}</p>
      <p className="text-xl mb-4">Chances: {chances}</p>
      {question && (
        <div className="text-3xl mb-4">
          {question.num1} {question.operation} {question.num2} = ?
        </div>
      )}
      <input
        ref={inputRef}
        type="number"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyPress={handleKeyPress}
        className="px-4 py-2 text-xl text-black bg-green-200 rounded mb-4"
        placeholder="Enter your answer"
      />
    </div>
  );
}