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
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface GameConfig {
  gridSize: number;
  canvasWidth: number;
  canvasHeight: number;
  gameSpeed: number;
  baseSpeed: number;
  speedIncrement: number;
  levelThreshold: number;
}
