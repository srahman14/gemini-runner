import { GameObject } from './types';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const GROUND_HEIGHT = 50;
export const GRAVITY = 0.6;
export const JUMP_FORCE = -15;
export const PLAYER_SPEED = 5;
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 40;
export const OBSTACLE_MIN_HEIGHT = 20;
export const OBSTACLE_MAX_HEIGHT = 50;
export const OBSTACLE_WIDTH = 30;
export const COLLECTIBLE_SIZE = 20;
export const PLATFORM_HEIGHT = 20;
export const PLATFORM_MIN_WIDTH = 80;
export const PLATFORM_MAX_WIDTH = 150;
export const ENEMY_WIDTH = 40;
export const ENEMY_HEIGHT = 40;
export const ENEMY_SPEED = 2;
export const WEAPON_WIDTH = 30;
export const WEAPON_HEIGHT = 30;
export const PROJECTILE_WIDTH = 15;
export const PROJECTILE_HEIGHT = 5;
export const PROJECTILE_SPEED = 10;


export const LEVEL_LENGTH = 5000; // pixels

export const PREDEFINED_LEVELS: { 
  [key: number]: { 
    name: string; 
    objects: GameObject[];
    theme: {
      backgroundColor: string;
      groundColor: string;
    } 
  } 
} = {
  1: {
    name: "Cyber City Sprint",
    objects: generateRandomLevelObjects(15, 10, 5, 5, 1, ['box']),
    theme: {
      backgroundColor: '#0c4a6e', // Tailwind sky-800
      groundColor: '#4b5563'  // Tailwind gray-600
    }
  },
  2: {
    name: "Neon Night Run",
    objects: generateRandomLevelObjects(25, 15, 8, 8, 2, ['box', 'tall_box']),
    theme: {
      backgroundColor: '#3730a3', // Tailwind indigo-900
      groundColor: '#6b21a8'  // Tailwind purple-800
    }
  },
  3: {
    name: "Digital Fortress",
    objects: generateRandomLevelObjects(35, 20, 12, 12, 3, ['box', 'tall_box', 'spike']),
    theme: {
      backgroundColor: '#7f1d1d', // Tailwind red-900
      groundColor: '#1f2937'  // Tailwind gray-800
    }
  },
};

function generateRandomLevelObjects(obstacleCount: number, collectibleCount: number, platformCount: number, enemyCount: number, weaponCount: number, obstacleTypes: ('box' | 'spike' | 'tall_box')[]): GameObject[] {
  const objects: GameObject[] = [];
  let currentX = 500;
  let objectId = 0;

  // Generate Platforms
  for (let i = 0; i < platformCount; i++) {
    currentX += 350 + Math.random() * 250;
    const width = PLATFORM_MIN_WIDTH + Math.random() * (PLATFORM_MAX_WIDTH - PLATFORM_MIN_WIDTH);
    const y = GAME_HEIGHT - GROUND_HEIGHT - (80 + Math.random() * 100); // Platforms are 80-180px above ground
    objects.push({
      id: objectId++,
      x: currentX,
      y: y,
      width: width,
      height: PLATFORM_HEIGHT,
      type: 'platform',
    });
  }

  // Generate Obstacles
  currentX = 500;
  for (let i = 0; i < obstacleCount; i++) {
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    currentX += 400 + Math.random() * 400;
    
    let height = OBSTACLE_MIN_HEIGHT + Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT);
    let width = OBSTACLE_WIDTH;
    let y = GAME_HEIGHT - GROUND_HEIGHT - height;

    switch(type) {
      case 'tall_box':
        height *= 1.8; // Make it taller
        y = GAME_HEIGHT - GROUND_HEIGHT - height;
        break;
      case 'spike':
        height = OBSTACLE_WIDTH; // Spikes are as tall as they are wide
        y = GAME_HEIGHT - GROUND_HEIGHT - height;
        break;
      case 'box':
      default:
        // standard height, already set
        break;
    }

    objects.push({
      id: objectId++,
      x: currentX,
      y: y,
      width: width,
      height: height,
      type: 'obstacle',
      obstacleType: type,
    });
  }

  // Generate Collectibles
  currentX = 600;
  for (let i = 0; i < collectibleCount; i++) {
    currentX += 300 + Math.random() * 300;
    const yPos = GAME_HEIGHT - GROUND_HEIGHT - COLLECTIBLE_SIZE - (Math.random() * 150 + 50); // Position above ground
     objects.push({
      id: objectId++,
      x: currentX,
      y: yPos,
      width: COLLECTIBLE_SIZE,
      height: COLLECTIBLE_SIZE,
      type: 'collectible',
    });
  }

  // Generate Enemies
  const platforms = objects.filter(o => o.type === 'platform');
  const groundPatches = Math.floor(LEVEL_LENGTH / 800);
  for (let i = 0; i < enemyCount; i++) {
    let spawnSurface;
    // Spawn on a platform or on the ground
    if (Math.random() > 0.4 && platforms.length > 0) {
      spawnSurface = platforms[Math.floor(Math.random() * platforms.length)];
      objects.push({
        id: objectId++,
        x: spawnSurface.x + spawnSurface.width / 2,
        y: spawnSurface.y - ENEMY_HEIGHT,
        width: ENEMY_WIDTH,
        height: ENEMY_HEIGHT,
        type: 'enemy',
        vx: ENEMY_SPEED * (Math.random() > 0.5 ? 1 : -1)
      });
    } else {
      // Spawn on the ground
      const x = 800 + Math.random() * (LEVEL_LENGTH - 1000);
      objects.push({
        id: objectId++,
        x: x,
        y: GAME_HEIGHT - GROUND_HEIGHT - ENEMY_HEIGHT,
        width: ENEMY_WIDTH,
        height: ENEMY_HEIGHT,
        type: 'enemy',
        vx: ENEMY_SPEED * (Math.random() > 0.5 ? 1 : -1)
      });
    }
  }
  
  // Generate Weapons
  currentX = 1000;
  for (let i = 0; i < weaponCount; i++) {
    currentX += (LEVEL_LENGTH / (weaponCount + 1)) * (0.8 + Math.random() * 0.4);
    const yPos = GAME_HEIGHT - GROUND_HEIGHT - WEAPON_HEIGHT - (Math.random() * 100 + 20); // Position above ground
    objects.push({
      id: objectId++,
      x: currentX,
      y: yPos,
      width: WEAPON_WIDTH,
      height: WEAPON_HEIGHT,
      type: 'weapon',
    });
  }

  return objects.sort((a,b) => a.x - b.x);
}