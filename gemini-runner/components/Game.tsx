import React, { useState, useEffect, useRef } from 'react';
import { PlayerCustomization, GameObject, GeneratedLevelTheme } from '../types';
import { useGameLoop } from '../hooks/useGameLoop';
import { 
  GAME_WIDTH, GAME_HEIGHT, GROUND_HEIGHT, GRAVITY, JUMP_FORCE, PLAYER_SPEED, 
  PLAYER_WIDTH, PLAYER_HEIGHT, LEVEL_LENGTH, PREDEFINED_LEVELS, PROJECTILE_SPEED,
  PROJECTILE_WIDTH, PROJECTILE_HEIGHT
} from '../constants';

interface GameProps {
  customization: PlayerCustomization;
  onGameEnd: (score: number) => void;
  levelId: number;
  levelTheme: GeneratedLevelTheme | null;
}

const Game: React.FC<GameProps> = ({ customization, onGameEnd, levelId, levelTheme }) => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [levelProgress, setLevelProgress] = useState(0);
  const [ammo, setAmmo] = useState(10); // Start with 10 bullets

  const playerPos = useRef({ x: 100, y: GAME_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT });
  const playerVel = useRef({ y: 0 });
  const cameraX = useRef(0);
  const jumps = useRef(0);

  const levelData = levelId > 0 
  ? PREDEFINED_LEVELS[levelId] 
  : { 
      name: levelTheme?.levelName || "Custom Level", 
      objects: PREDEFINED_LEVELS[1].objects, // Use a base for random objects
      theme: {
          backgroundColor: '#111827', // gray-900
          groundColor: '#374151'    // gray-700
      } 
    };
  const [gameObjects, setGameObjects] = useState<GameObject[]>(() => JSON.parse(JSON.stringify(levelData.objects)));
  const gameObjectsRef = useRef(gameObjects);
  useEffect(() => {
    gameObjectsRef.current = gameObjects;
  }, [gameObjects]);

  const theme = {
    bg: levelTheme?.backgroundColor || levelData.theme.backgroundColor,
    ground: levelTheme?.groundColor || levelData.theme.groundColor,
    platform: levelTheme?.platformColor || '#84cc16', // lime-500
    player: levelTheme?.playerColor,
    obstacle: levelTheme?.obstacleColor || '#ef4444', // red-500
    collectible: levelTheme?.collectibleColor || '#facc15', // yellow-400
    enemy: levelTheme?.enemyColor || '#f97316', // orange-500
  };

  const checkCollision = (a: {x: number, y: number, width: number, height: number}, b: GameObject) => {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  };

  useGameLoop((deltaTime) => {
    if (gameOver || !gameStarted) return;
    
    // --- Pre-computation ---
    const playerOldY = playerPos.current.y;
    
    // --- Player Physics ---
    playerVel.current.y += GRAVITY;
    playerPos.current.y += playerVel.current.y;
    
    const activePlayer = { ...playerPos.current, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
    
    // --- Collision Resolution ---
    let onSolidSurface = false;
    
    // Check platforms
    const platforms = gameObjectsRef.current.filter(p => p.type === 'platform');
    for (const platform of platforms) {
        // Are we moving down and do we currently overlap with the platform?
        if (playerVel.current.y > 0 && checkCollision(activePlayer, platform)) {
            // Was the player fully above the platform in the previous frame?
            // This prevents "snapping up" if hitting a platform from the side.
            if ((playerOldY + PLAYER_HEIGHT) <= platform.y) {
                playerPos.current.y = platform.y - PLAYER_HEIGHT; // Snap position to top of platform
                playerVel.current.y = 0; // Stop vertical movement
                jumps.current = 0; // Reset jumps
                onSolidSurface = true;
                break; // We've landed, no need to check other platforms
            }
        }
    }

    // Check ground if not on a platform
    if (!onSolidSurface && playerPos.current.y >= GAME_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT) {
      playerPos.current.y = GAME_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT;
      playerVel.current.y = 0;
      jumps.current = 0;
    }

    // --- Player and Camera Movement ---
    playerPos.current.x += PLAYER_SPEED;
    cameraX.current = playerPos.current.x - 100;
    setLevelProgress((playerPos.current.x / LEVEL_LENGTH) * 100);

    // --- Level Complete Condition ---
    if (playerPos.current.x >= LEVEL_LENGTH) {
        setGameOver(true);
        setScore(s => s + 1000);
        return;
    }

    // --- State updates for Game Objects ---
    setGameObjects(prevGameObjects => {
        const projectiles = prevGameObjects.filter(o => o.type === 'projectile');
        const enemies = prevGameObjects.filter(o => o.type === 'enemy');
        const objectsToRemove = new Set<number>();
        let scoreToAdd = 0;
        let endGame = false;

        // Projectile vs Enemy collisions
        for (const p of projectiles) {
            for (const e of enemies) {
                if (checkCollision(p, e)) {
                    objectsToRemove.add(p.id);
                    objectsToRemove.add(e.id);
                    scoreToAdd += 250;
                }
            }
        }

        // Move objects and check player collisions
        const updatedGameObjects = prevGameObjects
            .map(obj => {
                // Enemy movement
                if (obj.type === 'enemy') {
                    const newPos = { ...obj, x: obj.x + (obj.vx || 0) };
                    // Basic patrol AI: reverse direction at platform edges
                    let isOnSupport = false;
                    const supportCandidates = [
                        ...prevGameObjects.filter(o => o.type === 'platform'),
                        {x: 0, y: GAME_HEIGHT-GROUND_HEIGHT, width: LEVEL_LENGTH + GAME_WIDTH, height: GROUND_HEIGHT} // Ground
                    ];
                    for(const support of supportCandidates){
                         if(
                           Math.abs((obj.y + obj.height) - support.y) < 5 && // on top of the support
                           obj.x > support.x && obj.x < support.x + support.width
                         ) {
                            isOnSupport = true;
                            if (newPos.x <= support.x || newPos.x + newPos.width >= support.x + support.width) {
                                newPos.vx = -(newPos.vx || 0);
                            }
                            break;
                         }
                    }
                    return newPos;
                }
                // Projectile movement
                if (obj.type === 'projectile') {
                    if (obj.x > cameraX.current + GAME_WIDTH) objectsToRemove.add(obj.id); // remove off-screen
                    return { ...obj, x: obj.x + (obj.vx || 0) };
                }
                return obj;
            })
            .filter(obj => {
                if (objectsToRemove.has(obj.id)) return false;
                if (!checkCollision(activePlayer, obj)) return true;

                // Handle player collisions
                switch (obj.type) {
                    case 'obstacle':
                    case 'enemy':
                        endGame = true;
                        return true;
                    case 'collectible':
                        scoreToAdd += 100;
                        return false;
                    case 'weapon':
                        setAmmo(prev => prev + 10);
                        return false;
                }
                return true;
            });
        
        if (scoreToAdd > 0) setScore(s => s + scoreToAdd);
        if (endGame) setGameOver(true);
        
        return updatedGameObjects;
    });

  }, gameStarted && !gameOver);

  const handleJump = () => {
    if (gameOver || !gameStarted) return;
    const canDoubleJump = customization.ability === 'double_jump';
    if (jumps.current < (canDoubleJump ? 2 : 1)) {
      playerVel.current.y = JUMP_FORCE;
      jumps.current++;
    }
  };

  const handleShoot = () => {
      if (gameOver || !gameStarted || ammo <= 0) return;
      
      setAmmo(prev => prev - 1);

      const newProjectile: GameObject = {
          id: Date.now(),
          type: 'projectile',
          x: playerPos.current.x + PLAYER_WIDTH,
          y: playerPos.current.y + PLAYER_HEIGHT / 2 - PROJECTILE_HEIGHT / 2,
          width: PROJECTILE_WIDTH,
          height: PROJECTILE_HEIGHT,
          vx: PROJECTILE_SPEED,
      };
      setGameObjects(prev => [...prev, newProjectile]);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!gameStarted && (e.code === 'Space' || e.code === 'ArrowUp')) {
            setGameStarted(true);
        }
        if (gameOver) return;
        
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            handleJump();
        }
        if (e.code === 'KeyX') {
            handleShoot();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, gameOver, customization.ability, ammo]);

  return (
    <div className="flex flex-col items-center">
      <div className={`relative w-full max-w-[${GAME_WIDTH}px] h-[${GAME_HEIGHT}px] overflow-hidden rounded-lg shadow-2xl border-2 border-gray-600`} style={{width: GAME_WIDTH, height: GAME_HEIGHT, backgroundColor: theme.bg}}>
        {/* UI Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center text-white font-press-start text-lg">
          <span>Score: {score}</span>
           {ammo > 0 && <span className="text-yellow-400">Ammo: {ammo} (X)</span>}
          <span>{levelData.name}</span>
        </div>
        <div className="absolute top-12 left-4 right-4 z-10">
          <div className="w-full bg-gray-600 rounded-full h-4">
              <div className="bg-green-500 h-4 rounded-full" style={{ width: `${levelProgress}%` }}></div>
          </div>
        </div>


        {/* Game Over Screen */}
        {(gameOver || !gameStarted) && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center z-20">
                <h2 className="text-5xl font-press-start text-cyan-400 mb-4">
                    {gameOver ? (playerPos.current.x >= LEVEL_LENGTH ? 'Level Complete!' : 'Game Over') : 'Get Ready!'}
                </h2>
                <p className="text-xl mb-6">
                    {gameOver ? `Final Score: ${score}` : 'Space to Start/Jump | X to Shoot'}
                </p>
                {gameOver && <button onClick={() => onGameEnd(score)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-xl">Main Menu</button>}
            </div>
        )}

        {/* Game World */}
        <div className="absolute inset-0" style={{ transform: `translateX(-${cameraX.current}px)` }}>
            {/* Player */}
            <div className="absolute flex items-center justify-center text-xl whitespace-nowrap" style={{ 
                left: playerPos.current.x, 
                top: playerPos.current.y, 
                width: PLAYER_WIDTH, 
                height: PLAYER_HEIGHT, 
                backgroundColor: theme.player,
                borderRadius: theme.player ? '8px' : '0'
              }}>
              {!theme.player && <span>{customization.avatar}</span>}
              {ammo > 0 && (
                <div style={{
                  width: 12,
                  height: 8,
                  backgroundColor: theme.player ? 'rgba(255, 255, 255, 0.8)' : '#6b7280', // A light color on themed player, gray otherwise
                  marginLeft: !theme.player ? 4 : 0, // Add margin only if avatar is also present
                  border: '1px solid #1f2937',
                  borderRadius: '2px'
                }}
                aria-label="Weapon"
                ></div>
              )}
            </div>

            {/* Game Objects */}
            {gameObjects.map(obj => {
              const baseStyle: React.CSSProperties = {
                position: 'absolute',
                left: obj.x,
                top: obj.y,
                width: obj.width,
                height: obj.height,
                transition: 'left 50ms linear, top 50ms linear' // Smooth movement
              };

              switch(obj.type) {
                case 'obstacle':
                    const obstacleStyle: React.CSSProperties = { ...baseStyle, backgroundColor: theme.obstacle };
                    if (obj.obstacleType === 'spike') obstacleStyle.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
                    else obstacleStyle.borderRadius = '0.125rem';
                    return <div key={obj.id} style={obstacleStyle}></div>;
                case 'collectible':
                    return <div key={obj.id} style={{ ...baseStyle, backgroundColor: theme.collectible, borderRadius: '9999px' }}></div>;
                case 'platform':
                    return <div key={obj.id} style={{ ...baseStyle, backgroundColor: theme.platform, borderRadius: '0.25rem' }}></div>;
                case 'enemy':
                    return <div key={obj.id} style={{ ...baseStyle, backgroundColor: theme.enemy, borderRadius: '0.25rem' }} className="flex items-center justify-center text-white text-lg">(ò_ó)</div>;
                case 'weapon':
                    return <div key={obj.id} style={{ ...baseStyle, backgroundColor: '#4ade80', borderRadius: '0.125rem', border: '2px solid white' }} className="flex items-center justify-center font-bold text-black">X</div>;
                case 'projectile':
                    return <div key={obj.id} style={{ ...baseStyle, backgroundColor: '#fde047', borderRadius: '2px' }}></div>;
                default:
                    return null;
              }
            })}

            {/* Ground */}
            <div className="absolute bottom-0 left-0" style={{ height: GROUND_HEIGHT, width: LEVEL_LENGTH + GAME_WIDTH, backgroundColor: theme.ground }}></div>
        </div>
      </div>
    </div>
  );
};

export default Game;