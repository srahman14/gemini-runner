import React, { useState } from 'react';
import { generateLevelTheme } from '../services/geminiService';
import { GeneratedLevelTheme } from '../types';

interface LevelGeneratorProps {
  onBack: () => void;
  onGenerate: (theme: GeneratedLevelTheme) => void;
}

const LevelGenerator: React.FC<LevelGeneratorProps> = ({ onBack, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTheme, setGeneratedTheme] = useState<GeneratedLevelTheme | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a theme idea.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedTheme(null);
    const theme = await generateLevelTheme(prompt);
    setIsLoading(false);
    if (theme) {
      setGeneratedTheme(theme);
    } else {
      setError('Could not generate theme. Please try a different prompt or check your API key.');
    }
  };

  return (
    <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-2xl border-2 border-purple-500">
      <h1 className="text-4xl font-press-start text-center mb-6 text-cyan-400">AI Level Generator</h1>
      <p className="text-center text-gray-400 mb-6">Describe a theme for a level, and let Gemini create it!</p>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'a spooky graveyard at midnight'"
          className="flex-grow bg-gray-900 text-white p-3 rounded-lg border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg border-b-4 border-purple-800 active:border-b-0 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:border-b-0"
        >
          {isLoading ? 'Generating...' : '✨ Generate'}
        </button>
      </div>

      {error && <p className="text-red-400 text-center mb-4">{error}</p>}
      
      {generatedTheme && (
        <div className="mt-6 p-6 bg-gray-900 rounded-lg border-2 border-gray-700 text-left animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-4">{generatedTheme.levelName}</h2>
            <p className="text-center text-gray-300 mb-4 italic">"{generatedTheme.description}"</p>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div style={{backgroundColor: generatedTheme.playerColor}} className="p-2 rounded">Player</div>
                <div style={{backgroundColor: generatedTheme.obstacleColor}} className="p-2 rounded">Obstacle</div>
                <div style={{backgroundColor: generatedTheme.collectibleColor}} className="p-2 rounded">Coin</div>
            </div>
            <div className="mt-4 p-4 rounded" style={{backgroundColor: generatedTheme.backgroundColor}}>
                <div className="h-8 rounded" style={{backgroundColor: generatedTheme.groundColor}}></div>
            </div>

            <button
                onClick={() => onGenerate(generatedTheme)}
                className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg border-b-4 border-green-700 active:border-b-0"
            >
                Play This Level!
            </button>
        </div>
      )}

      <button
        onClick={onBack}
        className="mt-8 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg border-b-4 border-blue-700 active:border-b-0"
      >
        Back to Menu
      </button>
    </div>
  );
};

export default LevelGenerator;
