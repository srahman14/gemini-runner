import React from 'react';
import { PlayerCustomization, Ability } from '../types';

interface CharacterCustomizerProps {
  customization: PlayerCustomization;
  setCustomization: React.Dispatch<React.SetStateAction<PlayerCustomization>>;
  onBack: () => void;
}

const AVATARS = ['(•_•)', '(O_O)', '[._.]', '^_^', '(>_<)', '{-_-}'];
const ABILITIES: { id: Ability; name: string; description: string }[] = [
  { id: 'double_jump', name: 'Double Jump', description: 'Allows you to jump a second time in mid-air.' },
  { id: 'speed_boost', name: 'Speed Boost', description: 'Grants a short burst of speed every 10 seconds.' },
  { id: 'shield', name: 'Shield', description: 'Protects you from one hit. Recharges after 20 seconds.' },
];

const CharacterCustomizer: React.FC<CharacterCustomizerProps> = ({ customization, setCustomization, onBack }) => {
  return (
    <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-2xl border-2 border-blue-500">
      <h1 className="text-4xl font-press-start text-center mb-8 text-cyan-400">Customize</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Choose Your Avatar</h2>
        <div className="flex justify-center gap-4 flex-wrap">
          {AVATARS.map(avatar => (
            <button
              key={avatar}
              onClick={() => setCustomization(c => ({ ...c, avatar }))}
              className={`text-5xl p-4 rounded-lg transition-transform duration-200 transform hover:scale-125 ${customization.avatar === avatar ? 'bg-blue-600 ring-4 ring-cyan-400' : 'bg-gray-700'}`}
            >
              {avatar}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Select Your Ability</h2>
        <div className="space-y-4">
          {ABILITIES.map(ability => (
            <button
              key={ability.id}
              onClick={() => setCustomization(c => ({ ...c, ability: ability.id }))}
              className={`w-full text-left p-4 rounded-lg transition-colors duration-200 ${customization.ability === ability.id ? 'bg-blue-600 ring-4 ring-cyan-400' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              <p className="font-bold text-lg">{ability.name}</p>
              <p className="text-sm text-gray-300">{ability.description}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onBack}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg border-b-4 border-green-700 active:border-b-0"
      >
        Save & Back
      </button>
    </div>
  );
};

export default CharacterCustomizer;