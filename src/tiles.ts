export enum TileType {
  Empty,
  Solid,
  Platform,
  SlopeLeft,
  SlopeRight,
}

export interface Tile {
  type: TileType;
}
