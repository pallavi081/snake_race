import { Position } from './types/game';
import { Tile, TileType } from './tiles';

export interface PuzzleLevel {
  gridSize: number;
  foodPositions: Position[];
  obstaclePositions: Position[];
  maxMoves: number;
  initialSnake: Position[];
}

export const puzzleLevels: PuzzleLevel[] = [
  {
    gridSize: 10,
    foodPositions: [
      { x: 2, y: 2 },
      { x: 7, y: 7 },
    ],
    obstaclePositions: [
      { x: 5, y: 4 },
      { x: 5, y: 5 },
      { x: 5, y: 6 },
    ],
    maxMoves: 30,
    initialSnake: [{ x: 1, y: 1 }],
  },
  {
    gridSize: 12,
    foodPositions: [
      { x: 1, y: 1 },
      { x: 10, y: 1 },
      { x: 1, y: 10 },
      { x: 10, y: 10 },
    ],
    obstaclePositions: [],
    maxMoves: 50,
    initialSnake: [{ x: 6, y: 6 }],
  },
];

export interface PhysicsLevel {
  gridSize: number;
  tiles: Tile[][];
  foodPositions: Position[];
  initialSnake: Position[];
}

export const physicsLevels: PhysicsLevel[] = [
  {
    gridSize: 20,
    tiles: Array(20).fill(0).map(() => Array(20).fill({ type: TileType.Empty })),
    foodPositions: [
      { x: 10, y: 5 },
    ],
    initialSnake: [{ x: 2, y: 2 }],
  }
];

// Add some platforms to the physics level
for (let i = 5; i < 15; i++) {
  physicsLevels[0].tiles[10][i] = { type: TileType.Platform };
}
