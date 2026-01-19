import { Position } from './types/game';
import { Tile, TileType } from './tiles';

export interface PuzzleLevel {
  gridSize: number;
  foodPositions: Position[];
  obstaclePositions: Position[];
  maxMoves: number;
  initialSnake: Position[];
}

const manualPuzzleLevels: PuzzleLevel[] = [
  // Level 1: The Beginning
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
  // Level 2: Four Corners
  {
    gridSize: 12,
    foodPositions: [
      { x: 1, y: 1 },
      { x: 10, y: 1 },
      { x: 1, y: 10 },
      { x: 10, y: 10 },
    ],
    obstaclePositions: [
      { x: 5, y: 5 }, { x: 6, y: 5 }, 
      { x: 5, y: 6 }, { x: 6, y: 6 }
    ],
    maxMoves: 50,
    initialSnake: [{ x: 6, y: 8 }],
  },
  // Level 3: The Maze
  {
    gridSize: 15,
    foodPositions: [
      { x: 13, y: 2 },
      { x: 2, y: 12 },
      { x: 7, y: 7 }
    ],
    obstaclePositions: [
      { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 },
      { x: 11, y: 9 }, { x: 11, y: 10 }, { x: 11, y: 11 },
      { x: 7, y: 0 }, { x: 7, y: 1 }, { x: 7, y: 2 },
      { x: 7, y: 12 }, { x: 7, y: 13 }, { x: 7, y: 14 }
    ],
    maxMoves: 60,
    initialSnake: [{ x: 1, y: 7 }],
  },
  // Level 4: Spiral Challenge
  {
    gridSize: 13,
    foodPositions: [{ x: 6, y: 6 }],
    obstaclePositions: [
       {x: 2, y: 2}, {x: 3, y: 2}, {x: 4, y: 2}, {x: 5, y: 2}, {x: 6, y: 2}, {x: 7, y: 2}, {x: 8, y: 2}, {x: 9, y: 2}, {x: 10, y: 2},
       {x: 10, y: 3}, {x: 10, y: 4}, {x: 10, y: 5}, {x: 10, y: 6}, {x: 10, y: 7}, {x: 10, y: 8}, {x: 10, y: 9}, {x: 10, y: 10},
       {x: 9, y: 10}, {x: 8, y: 10}, {x: 7, y: 10}, {x: 6, y: 10}, {x: 5, y: 10}, {x: 4, y: 10}, {x: 3, y: 10}, {x: 2, y: 10},
       {x: 2, y: 9}, {x: 2, y: 8}, {x: 2, y: 7}, {x: 2, y: 6}, {x: 2, y: 5}, {x: 2, y: 4},
       {x: 4, y: 4}, {x: 5, y: 4}, {x: 6, y: 4}, {x: 7, y: 4}, {x: 8, y: 4},
       {x: 8, y: 5}, {x: 8, y: 6}, {x: 8, y: 7}, {x: 8, y: 8},
       {x: 7, y: 8}, {x: 6, y: 8}, {x: 5, y: 8}, {x: 4, y: 8},
       {x: 4, y: 7}, {x: 4, y: 6}
    ],
    maxMoves: 120,
    initialSnake: [{ x: 0, y: 0 }],
  },
  // Level 5: Tight Squeeze
  {
    gridSize: 10,
    foodPositions: [
      { x: 0, y: 9 },
      { x: 9, y: 0 },
      { x: 4, y: 4 }
    ],
    obstaclePositions: [
      { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 7, y: 1 }, { x: 8, y: 1 },
      { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 8, y: 3 },
      { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 },
      { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 },
    ],
    maxMoves: 80,
    initialSnake: [{ x: 0, y: 0 }],
  },
];

const generatePuzzleLevels = (count: number): PuzzleLevel[] => {
  const levels: PuzzleLevel[] = [];
  for (let i = 0; i < count; i++) {
    const levelNum = manualPuzzleLevels.length + i + 1;
    const gridSize = Math.min(25, 10 + Math.floor(levelNum / 3));
    const numObstacles = Math.floor(gridSize * 1.5) + levelNum;
    const numFood = 3 + Math.floor(levelNum / 8);
    
    const snake: Position[] = [{ x: 1, y: 1 }];
    const obstacles: Position[] = [];
    const food: Position[] = [];
    
    const isOccupied = (p: Position) => 
      snake.some(s => s.x === p.x && s.y === p.y) ||
      obstacles.some(o => o.x === p.x && o.y === p.y) ||
      food.some(f => f.x === p.x && f.y === p.y);

    // Add obstacles
    for (let j = 0; j < numObstacles; j++) {
      let p: Position;
      let attempts = 0;
      do {
        p = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
        attempts++;
      } while ((isOccupied(p) || (p.x < 4 && p.y < 4)) && attempts < 20);
      if (attempts < 20) obstacles.push(p);
    }

    // Add food
    for (let j = 0; j < numFood; j++) {
      let p: Position;
      let attempts = 0;
      do {
        p = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
        attempts++;
      } while (isOccupied(p) && attempts < 20);
      if (attempts < 20) food.push(p);
    }

    levels.push({
      gridSize,
      initialSnake: snake,
      obstaclePositions: obstacles,
      foodPositions: food,
      maxMoves: Math.floor(gridSize * 2.5) + numObstacles + numFood * 5
    });
  }
  return levels;
};

export interface PhysicsLevel {
  gridSize: number;
  tiles: Tile[][];
  foodPositions: Position[];
  initialSnake: Position[];
}

const createPhysicsGrid = (size: number): Tile[][] => 
  Array(size).fill(null).map(() => Array(size).fill({ type: TileType.Empty }));

// Level 1: Introduction
const level1Tiles = createPhysicsGrid(20);
for (let i = 5; i < 15; i++) level1Tiles[10][i] = { type: TileType.Platform };
for (let i = 0; i < 20; i++) level1Tiles[19][i] = { type: TileType.Solid };

// Level 2: Stairway to Heaven
const level2Tiles = createPhysicsGrid(20);
for (let i = 0; i < 20; i++) level2Tiles[19][i] = { type: TileType.Solid };
for (let i = 0; i < 5; i++) {
    level2Tiles[15][2 + i] = { type: TileType.Platform };
    level2Tiles[12][8 + i] = { type: TileType.Platform };
    level2Tiles[9][14 + i] = { type: TileType.Platform };
}

// Level 3: Floating Islands
const level3Tiles = createPhysicsGrid(25);
// Floor gaps
for (let i = 0; i < 8; i++) level3Tiles[24][i] = { type: TileType.Solid };
for (let i = 17; i < 25; i++) level3Tiles[24][i] = { type: TileType.Solid };
// Islands
for (let i = 10; i < 15; i++) level3Tiles[18][i] = { type: TileType.Platform };
for (let i = 5; i < 8; i++) level3Tiles[12][i] = { type: TileType.Platform };
for (let i = 17; i < 20; i++) level3Tiles[12][i] = { type: TileType.Platform };
// High platform
for (let i = 10; i < 15; i++) level3Tiles[6][i] = { type: TileType.Platform };

const manualPhysicsLevels: PhysicsLevel[] = [
  {
    gridSize: 20,
    tiles: level1Tiles,
    foodPositions: [{ x: 10, y: 5 }],
    initialSnake: [{ x: 2, y: 15 }],
  },
  {
    gridSize: 20,
    tiles: level2Tiles,
    foodPositions: [
        { x: 4, y: 13 },
        { x: 10, y: 10 },
        { x: 16, y: 7 }
    ],
    initialSnake: [{ x: 2, y: 17 }],
  },
  {
    gridSize: 25,
    tiles: level3Tiles,
    foodPositions: [
        { x: 12, y: 16 },
        { x: 6, y: 10 },
        { x: 18, y: 10 },
        { x: 12, y: 4 }
    ],
    initialSnake: [{ x: 2, y: 20 }],
  }
];

const generatePhysicsLevels = (count: number): PhysicsLevel[] => {
  const levels: PhysicsLevel[] = [];
  for (let i = 0; i < count; i++) {
    const levelNum = manualPhysicsLevels.length + i + 1;
    const gridSize = 20 + Math.floor(levelNum / 5);
    const tiles = createPhysicsGrid(gridSize);
    
    // Ground
    for (let x = 0; x < gridSize; x++) tiles[gridSize - 1][x] = { type: TileType.Solid };
    
    // Random Platforms
    const numPlatforms = 5 + Math.floor(levelNum / 2);
    const platforms: {x: number, y: number, w: number}[] = [];
    
    for (let j = 0; j < numPlatforms; j++) {
      const w = 2 + Math.floor(Math.random() * 5);
      const x = Math.floor(Math.random() * (gridSize - w));
      const y = gridSize - 3 - Math.floor(Math.random() * (gridSize - 5));
      
      for (let k = 0; k < w; k++) {
        if (y >= 0 && y < gridSize && x+k < gridSize) {
             tiles[y][x+k] = { type: TileType.Platform };
        }
      }
      platforms.push({x, y, w});
    }

    // Food
    const foodPositions: Position[] = [];
    const numFood = 3 + Math.floor(levelNum / 10);
    for(let j=0; j<numFood; j++) {
        if (platforms.length > 0) {
            const plat = platforms[Math.floor(Math.random() * platforms.length)];
            foodPositions.push({
                x: plat.x + Math.floor(Math.random() * plat.w),
                y: plat.y - 1
            });
        } else {
             foodPositions.push({ x: 5 + j*2, y: gridSize - 2 });
        }
    }

    levels.push({
      gridSize,
      tiles,
      foodPositions,
      initialSnake: [{ x: 2, y: gridSize - 2 }]
    });
  }
  return levels;
};

export const puzzleLevels: PuzzleLevel[] = [...manualPuzzleLevels, ...generatePuzzleLevels(45)];
export const physicsLevels: PhysicsLevel[] = [...manualPhysicsLevels, ...generatePhysicsLevels(47)];
