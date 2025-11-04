import React, { useState, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import CharacterCustomizer from './components/CharacterCustomizer';
import Leaderboard from './components/Leaderboard';
import Game from './components/Game';
import LevelGenerator from './components/LevelGenerator';
import { GameScreen, PlayerCustomization, GeneratedLevelTheme } from './types';

const App: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>(GameScreen.MainMenu);
  const [customization, setCustomization] = useState<PlayerCustomization>(() => {
    const saved = localStorage.getItem('playerCustomization');
    return saved ? JSON.parse(saved) : { avatar: '(•_•)', ability: 'double_jump' };
  });
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('highScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [levelTheme, setLevelTheme] = useState<GeneratedLevelTheme | null>(null);
  const [level, setLevel] = useState<number>(1);

  useEffect(() => {
    localStorage.setItem('playerCustomization', JSON.stringify(customization));
  }, [customization]);

  useEffect(() => {
    localStorage.setItem('highScore', highScore.toString());
  }, [highScore]);

  const handleGameEnd = (score: number) => {
    if (score > highScore) {
      setHighScore(score);
    }
    setScreen(GameScreen.MainMenu);
  };

  const handleStartGame = (levelId: number, theme: GeneratedLevelTheme | null = null) => {
    setLevel(levelId);
    setLevelTheme(theme);
    setScreen(GameScreen.Game);
  };
  
  const renderScreen = () => {
    switch (screen) {
      case GameScreen.CharacterCustomizer:
        return <CharacterCustomizer customization={customization} setCustomization={setCustomization} onBack={() => setScreen(GameScreen.MainMenu)} />;
      case GameScreen.Leaderboard:
        return <Leaderboard highScore={highScore} onBack={() => setScreen(GameScreen.MainMenu)} />;
      case GameScreen.LevelGenerator:
        return <LevelGenerator onBack={() => setScreen(GameScreen.MainMenu)} onGenerate={(theme) => handleStartGame(0, theme)} />;
      case GameScreen.Game:
        return <Game customization={customization} onGameEnd={handleGameEnd} levelId={level} levelTheme={levelTheme} />;
      case GameScreen.MainMenu:
      default:
        return <MainMenu setScreen={setScreen} onStartGame={handleStartGame}/>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="container mx-auto max-w-4xl text-center">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;