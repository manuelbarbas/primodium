import { CoordMap } from "@latticexyz/utils";
import { ChunkManager } from "./ChunkManager";
import { pixelToChunkCoord } from "@latticexyz/phaserx";
import { BaseAsteroid } from "../../../client/src/game/lib/objects/Asteroid/BaseAsteroid";
import { Building } from "../../../client/src/game/lib/objects/Building";
import { Fleet } from "../../../client/src/game/lib/objects/Fleet";
import { createCamera } from "./createCamera";
import { Coord } from "../../types";
import { TransitLine } from "src/game/lib/objects/TransitLine";
import { TargetLine } from "src/game/lib/objects/TargetLine";
type PrimodiumGameObject = BaseAsteroid | Building | Fleet | TransitLine | TargetLine;

export class StaticObjectManager {
  private chunkManager;
  private coordMap = new CoordMap<PrimodiumGameObject[]>();
  private objMap = new Map<string, PrimodiumGameObject>();
  private chunkSize: number;
  private count = 0;
  private onNewObjectCallbacks: ((id: string) => void)[] = [];

  constructor(camera: ReturnType<typeof createCamera>, chunkSize: number) {
    this.chunkSize = chunkSize;
    this.chunkManager = new ChunkManager(
      camera,
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

  add(id: string, object: PrimodiumGameObject, cull = false) {
    if (this.objMap.has(id)) return;
    this.objMap.set(id, object);

    if (cull) {
      const chunkCoord = pixelToChunkCoord({ x: object.x, y: object.y }, this.chunkSize);

      const objects = this.coordMap.get(chunkCoord) ?? [];

      if (!objects.length) this.coordMap.set(chunkCoord, [object]);
      else objects.push(object);

      if (this.chunkManager.isVisible(chunkCoord)) {
        this.count--;
        if (!object.isSpawned()) {
          object.spawn();
        }
        object.setActive(true).setVisible(true);
      }
    } else object.spawn();

    this.onNewObjectCallbacks.forEach((callback) => callback(id));
  }

  onNewObject(callback: (id: string) => void) {
    this.onNewObjectCallbacks.push(callback);

    return () => {
      const index = this.onNewObjectCallbacks.indexOf(callback);
      if (index !== -1) this.onNewObjectCallbacks.splice(index, 1);
    };
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

  get(id: string) {
    return this.objMap.get(id);
  }

  dispose() {
    this.objMap.forEach((object) => object.dispose());
    this.chunkManager.dispose();
  }
}
