import { CoordMap } from "@latticexyz/utils";
import { Coord, Scene } from "engine/types";
import { ChunkManager } from "./ChunkManager";
import { pixelToChunkCoord } from "@latticexyz/phaserx";
import { BaseAsteroid } from "../objects/Asteroid/BaseAsteroid";
import { Building } from "../objects/Building";
type PrimodiumGameObject = BaseAsteroid | Building;

export class StaticObjectManager {
  private chunkManager;
  private coordMap = new CoordMap<PrimodiumGameObject[]>();
  private objMap = new Map<string, PrimodiumGameObject>();
  private scene: Scene;
  private chunkSize: number;
  private count = 0;

  constructor(scene: Scene, chunkSize: number) {
    if (chunkSize % scene.tiled.tileWidth !== 0 || chunkSize % scene.tiled.tileHeight !== 0)
      throw new Error("Chunk size must be a factor of tile size");

    this.scene = scene;
    this.chunkSize = chunkSize;
    this.chunkManager = new ChunkManager(
      scene,
      chunkSize,
      (coord) => this.onEnterChunk(coord),
      (coord) => this.onExitChunk(coord)
    );
  }

  private onEnterChunk(chunkCoord: Coord) {
    const objects = this.coordMap.get(chunkCoord) ?? [];
    objects.forEach((object) => {
      this.count++;
      if (!object.isSpawned()) {
        object.spawn();
      }
      object.setActive(true).setVisible(true);
    });
  }

  private onExitChunk(chunkCoord: Coord) {
    const objects = this.coordMap.get(chunkCoord) ?? [];
    objects.forEach((object) => {
      this.count--;
      object.setActive(false).setVisible(false);
    });
  }

  add(id: string, object: PrimodiumGameObject) {
    if (this.objMap.has(id)) return;
    this.objMap.set(id, object);

    const chunkCoord = pixelToChunkCoord({ x: object.x, y: object.y }, this.chunkSize);

    const objects = this.coordMap.get(chunkCoord) ?? [];

    if (!objects.length) this.coordMap.set(chunkCoord, [object]);
    else objects.push(object);

    if (this.chunkManager.getVisibleChunks().has(this.chunkManager.getKeyForChunk(chunkCoord))) {
      this.count--;
      if (!object.isSpawned()) {
        object.spawn();
      }
      object.setActive(true).setVisible(true);
    }
  }

  remove(id: string) {
    const object = this.objMap.get(id);
    if (!object) return;

    const chunkCoord = pixelToChunkCoord({ x: object.x, y: object.y }, this.chunkSize);
    const objects = this.coordMap.get(chunkCoord) ?? [];

    const index = objects.indexOf(object);
    if (index !== -1) objects.splice(index, 1);

    this.objMap.delete(id);
    object.dispose();
  }

  dispose() {
    this.objMap.forEach((object) => object.dispose());
    this.chunkManager.dispose();
  }
}
