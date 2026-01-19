export interface Position {
  x: number;
  y: number;
}

export interface PowerUp {
  position: Position;
  type: PowerUpType;
  expiresAt: number;
}

export type PowerUpType = 'speed' | 'slow' | 'double' | 'shrink';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface Settings {
  foodColor: string;
  snakeHeadColor: string;
  snakeBodyColor: string;
  bgColor: string;
  gridColor: string;
  borderColor: string;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  gameOver: boolean;
  gameStarted: boolean;
  highScore: number;
  level: number;
  speed: number;
  powerUps: PowerUp[];
  activePowerUp: PowerUpType | null;
  powerUpEndTime: number;
  particles: Particle[];
  combo: number;
  lastFoodTime: number;
  difficulty: Difficulty;
  canvasWidth: number;
  canvasHeight: number;
  settings: Settings;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface GameConfig {
  gridSize: number;
  canvasWidth: number;
  canvasHeight: number;
  gameSpeed: number;
  baseSpeed: number;
  speedIncrement: number;
  levelThreshold: number;
}