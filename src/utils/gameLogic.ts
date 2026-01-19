import { Position, Direction, GameState, PowerUp, PowerUpType, Particle, Difficulty } from '../types/game.ts';

export const GRID_SIZE = 20;
export const SPEED_INCREMENT = 10;
export const LEVEL_THRESHOLD = 50;
export const COMBO_TIME_LIMIT = 3000; // 3 seconds

const BASE_SPEEDS: Record<Difficulty, number> = {
  Easy: 200,
  Medium: 150,
  Hard: 100,
};

export const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 }
];

export const POWER_UP_TYPES: PowerUpType[] = ['speed', 'slow', 'double', 'shrink'];
export const POWER_UP_DURATION = 5000; // 5 seconds
export const POWER_UP_SPAWN_CHANCE = 0.15; // 15% chance

export const generateFood = (snake: Position[], canvasWidth: number, canvasHeight: number): Position => {
  const maxX = Math.floor(canvasWidth / GRID_SIZE);
  const maxY = Math.floor(canvasHeight / GRID_SIZE);
  
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY)
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  
  return food;
};

export const generatePowerUp = (snake: Position[], food: Position, canvasWidth: number, canvasHeight: number): PowerUp | null => {
  if (Math.random() > POWER_UP_SPAWN_CHANCE) return null;
  
  const maxX = Math.floor(canvasWidth / GRID_SIZE);
  const maxY = Math.floor(canvasHeight / GRID_SIZE);
  
  let position: Position;
  do {
    position = {
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY)
    };
  } while (
    snake.some(segment => segment.x === position.x && segment.y === position.y) ||
    (position.x === food.x && position.y === food.y)
  );
  
  return {
    position,
    type: POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)],
    expiresAt: Date.now() + 10000 // 10 seconds to collect
  };
};

export const createParticles = (x: number, y: number, color: string): Particle[] => {
  const particles: Particle[] = [];
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: x * GRID_SIZE + GRID_SIZE / 2,
      y: y * GRID_SIZE + GRID_SIZE / 2,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 30,
      maxLife: 30,
      color
    });
  }
  return particles;
};

export const updateParticles = (particles: Particle[]): Particle[] => {
  return particles
    .map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      life: particle.life - 1,
      vx: particle.vx * 0.98,
      vy: particle.vy * 0.98
    }))
    .filter(particle => particle.life > 0);
};

export const moveSnake = (snake: Position[], direction: Direction): Position[] => {
  const head = { ...snake[0] };
  
  switch (direction) {
    case 'UP':
      head.y -= 1;
      break;
    case 'DOWN':
      head.y += 1;
      break;
    case 'LEFT':
      head.x -= 1;
      break;
    case 'RIGHT':
      head.x += 1;
      break;
  }
  
  return [head, ...snake.slice(0, -1)];
};

export const checkWallCollision = (head: Position, canvasWidth: number, canvasHeight: number): boolean => {
  const maxX = Math.floor(canvasWidth / GRID_SIZE);
  const maxY = Math.floor(canvasHeight / GRID_SIZE);
  
  return head.x < 0 || head.x >= maxX || head.y < 0 || head.y >= maxY;
};

export const checkSelfCollision = (snake: Position[]): boolean => {
  const head = snake[0];
  return snake.slice(1).some(segment => 
    segment.x === head.x && segment.y === head.y
  );
};

export const checkFoodCollision = (head: Position, food: Position): boolean => {
  return head.x === food.x && head.y === food.y;
};

export const checkPowerUpCollision = (head: Position, powerUps: PowerUp[]): PowerUp | null => {
  return powerUps.find(powerUp => 
    powerUp.position.x === head.x && powerUp.position.y === head.y
  ) || null;
};

export const calculateScore = (baseScore: number, combo: number, level: number): number => {
  const comboMultiplier = Math.min(combo, 10) * 0.5 + 1;
  const levelMultiplier = level * 0.2 + 1;
  return Math.floor(baseScore * comboMultiplier * levelMultiplier);
};

export const getGameSpeed = (level: number, powerUp: PowerUpType | null, difficulty: Difficulty): number => {
  let speed = BASE_SPEEDS[difficulty] - (level - 1) * SPEED_INCREMENT;
  
  if (powerUp === 'speed') speed *= 0.6;
  if (powerUp === 'slow') speed *= 1.5;
  
  return Math.max(speed, 50); // Minimum speed limit
};

export const getOppositeDirection = (direction: Direction): Direction => {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT'
  };
  return opposites[direction];
}