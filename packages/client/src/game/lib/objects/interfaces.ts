import { Coord } from "engine/types";

export interface IPrimodiumGameObject {
  spawn(): void;
  isSpawned(): boolean;
  getCoord(): Coord;
  dispose(): void;
}
