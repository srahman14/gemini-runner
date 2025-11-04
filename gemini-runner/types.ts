
export enum GameScreen {
  MainMenu,
  CharacterCustomizer,
  Leaderboard,
  Game,
  LevelGenerator,
}

export type Ability = 'double_jump' | 'speed_boost' | 'shield';

export interface PlayerCustomization {
  avatar: string;
  ability: Ability;
}

export interface GeneratedLevelTheme {
  levelName: string;
  backgroundColor: string;
  groundColor: string;
  platformColor: string;
  playerColor: string;
  obstacleColor: string;
  collectibleColor: string;
  enemyColor: string;
  description: string;
}

export interface GameObject {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'platform' | 'obstacle' | 'collectible' | 'enemy' | 'weapon' | 'projectile';
  obstacleType?: 'box' | 'spike' | 'tall_box';
  vx?: number;
}
