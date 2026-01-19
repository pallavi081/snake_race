import { Position } from './types/game';
import { TileType } from './tiles';

export interface PuzzleLevel {
  gridSize: number;
  initialSnake: Position[];
  foodPositions: Position[];
  obstaclePositions: Position[];
  maxMoves: number;
}

export interface PhysicsLevel {
  gridSize: number;
  initialSnake: Position[];
  foodPositions: Position[];
  tiles: TileType[][];
}

export const puzzleLevels: PuzzleLevel[] = [
  {
    gridSize: 10,
    initialSnake: [{x: 2, y: 5}, {x: 1, y: 5}, {x: 0, y: 5}],
    foodPositions: [{x: 5, y: 5}, {x: 8, y: 2}, {x: 8, y: 8}],
    obstaclePositions: [{x: 4, y: 4}, {x: 4, y: 5}, {x: 4, y: 6}],
    maxMoves: 25
  },
  {
    gridSize: 15,
    initialSnake: [{x: 3, y: 7}, {x: 2, y: 7}, {x: 1, y: 7}],
    foodPositions: [{x: 12, y: 2}, {x: 12, y: 12}, {x: 7, y: 7}],
    obstaclePositions: [
      {x: 6, y: 6}, {x: 7, y: 6}, {x: 8, y: 6},
      {x: 6, y: 8}, {x: 7, y: 8}, {x: 8, y: 8}
    ],
    maxMoves: 40
  }
];

const createGrid = (width: number, height: number, fill: TileType = TileType.Empty) => 
  Array(height).fill(null).map(() => Array(width).fill(fill));

const level1Grid = createGrid(40, 30);
// Ground
for(let x=0; x<40; x++) level1Grid[29][x] = TileType.Solid;
// Platforms
for(let x=10; x<20; x++) level1Grid[20][x] = TileType.Platform;
for(let x=25; x<35; x++) level1Grid[15][x] = TileType.Platform;
// Walls
for(let y=0; y<30; y++) {
  level1Grid[y][0] = TileType.Solid;
  level1Grid[y][39] = TileType.Solid;
}

export const physicsLevels: PhysicsLevel[] = [
  {
    gridSize: 40,
    initialSnake: [{x: 100, y: 100}],
    foodPositions: [{x: 300, y: 350}, {x: 600, y: 250}, {x: 500, y: 100}],
    tiles: level1Grid
  }
];