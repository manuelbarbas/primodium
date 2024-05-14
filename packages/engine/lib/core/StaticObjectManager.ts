import { ChunkManager } from "./ChunkManager";
import { createCamera } from "./createCamera";
import { Coord } from "../../types";
import { CoordMap } from "../util/coordMap";
import { pixelToChunkCoord } from "../util/coords";
import { ContainerLite } from "../../objects";

type Spawnable = {
  spawn(): void;
  isSpawned(): boolean;
  setVisible(visible: boolean): Phaser.GameObjects.GameObject;
};
export type PrimodiumGameObject = (
  | Phaser.GameObjects.Sprite
  | Phaser.GameObjects.Image
  | Phaser.GameObjects.Container
  | Phaser.GameObjects.BitmapText
  | Phaser.GameObjects.Line
  | ContainerLite
) &
  Spawnable;

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

  remove(id: string, destroy = false) {
    const object = this.objMap.get(id);
    if (!object) return;

    const chunkCoord = pixelToChunkCoord({ x: object.x, y: object.y }, this.chunkSize);
    const objects = this.coordMap.get(chunkCoord) ?? [];

    const index = objects.indexOf(object);
    if (index !== -1) objects.splice(index, 1);

    this.objMap.delete(id);
    if (destroy) object.destroy();
  }

  get(id: string) {
    return this.objMap.get(id);
  }

  has(id: string) {
    return this.objMap.has(id);
  }

  dispose() {
    this.objMap.forEach((object) => object.destroy());
    this.chunkManager.dispose();
  }
}
