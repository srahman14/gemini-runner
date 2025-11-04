import React, { useState, useEffect } from 'react';

interface LeaderboardProps {
  highScore: number;
  onBack: () => void;
}

const generateFakeScores = () => {
  return [
    { name: 'Cmdr_Glitch', score: 15430 + Math.floor(Math.random() * 100) },
    { name: 'Pixel_Prowler', score: 12100 + Math.floor(Math.random() * 100) },
    { name: 'Nyan_Cat_7', score: 11500 + Math.floor(Math.random() * 100) },
    { name: 'VectorVortex', score: 9800 + Math.floor(Math.random() * 100) },
    { name: 'Syntax_Error', score: 7650 + Math.floor(Math.random() * 100) },
  ].sort((a, b) => b.score - a.score);
};

const Leaderboard: React.FC<LeaderboardProps> = ({ highScore, onBack }) => {
  const [scores, setScores] = useState(generateFakeScores());

  useEffect(() => {
    const interval = setInterval(() => {
      setScores(generateFakeScores());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const allScores = [...scores, { name: 'You', score: highScore }]
    .sort((a, b) => b.score - a.score);

  return (
    <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-2xl border-2 border-yellow-500">
      <h1 className="text-4xl font-press-start text-center mb-8 text-cyan-400">Leaderboard</h1>
      
      <div className="space-y-3">
        {allScores.map((entry, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-4 rounded-lg transition-all duration-500 ${entry.name === 'You' ? 'bg-green-600' : 'bg-gray-700'}`}
          >
            <div className="flex items-center space-x-4">
              <span className="text-lg font-bold w-8">{index + 1}</span>
              <span className="text-lg">{entry.name}</span>
            </div>
            <span className="text-lg font-bold text-yellow-400">{entry.score.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onBack}
        className="mt-8 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg border-b-4 border-blue-700 active:border-b-0"
      >
        Back to Menu
      </button>
    </div>
  );
};

export default Leaderboard;
