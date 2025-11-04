import React from 'react';
import { GameScreen, GeneratedLevelTheme } from '../types';
import { PREDEFINED_LEVELS } from '../constants';

interface MainMenuProps {
  setScreen: (screen: GameScreen) => void;
  onStartGame: (levelId: number, theme?: GeneratedLevelTheme | null) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ setScreen, onStartGame }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 bg-gray-800 p-8 rounded-lg shadow-2xl border-2 border-purple-500">
      <h1 className="text-5xl font-press-start text-cyan-400 drop-shadow-[0_4px_0_#000]">Gemini Runner</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white col-span-full text-center">Select Level</h2>
        {Object.entries(PREDEFINED_LEVELS).map(([id, level]) => (
           <button 
             key={id}
             onClick={() => onStartGame(Number(id))}
             className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg border-b-4 border-green-700 active:border-b-0"
           >
             {level.name}
           </button>
        ))}
      </div>
      <div className="w-full max-w-md space-y-4">
        <button 
          onClick={() => setScreen(GameScreen.LevelGenerator)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg border-b-4 border-purple-800 active:border-b-0"
        >
          ✨ AI Level Generator
        </button>
        <button 
          onClick={() => setScreen(GameScreen.CharacterCustomizer)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg border-b-4 border-blue-700 active:border-b-0"
        >
          Customize Character
        </button>
        <button 
          onClick={() => setScreen(GameScreen.Leaderboard)}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg border-b-4 border-yellow-700 active:border-b-0"
        >
          Leaderboard
        </button>
      </div>
    </div>
  );
};

export default MainMenu;
