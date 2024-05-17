import { Entity } from "@latticexyz/recs";
import { Coord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { PrimodiumGameObject } from "engine/lib/core/StaticObjectManager";

export type BaseSpawnArgs = {
  scene: PrimodiumScene;
  entity: Entity;
  coord: Coord;
};

/**
 * @notice Create a wrapper for spawning future objects only when they enter visible chunks, to prevent creating objects + rendering them on launch/init and causing stutter
 *
 * This is useful for objects rendered inside an enter system (probably on initial load), at is will create this basic object containing their info & callback when spawning, which when
 * entering the visible chunk will effectively create the actual intended object, and this container will forget about this one.
 *
 * @param args.id A unique id for the container
 * @param args.scene The Primodium scene object
 * @param args.spawnCallback The callback to run when each object is spawned (gets visible for the first time)
 * @param args.register Whether to register the object on creation (can be useful to delay registration, for instance after intializing the superclass)
 */
export class DeferredRenderContainer<
  SpawnedObject extends PrimodiumGameObject = PrimodiumGameObject,
  SpawnArgs extends BaseSpawnArgs = BaseSpawnArgs
> {
  protected id: Entity;
  // entity -> spawn callback args
  protected objects: Map<Entity, SpawnArgs> = new Map();
  // coords (as string) -> entities at that coord
  protected chunkCoords: Map<string, Entity[]> = new Map();
  protected spawned: Map<Entity, boolean> = new Map();
  protected _scene: PrimodiumScene;
  // shared callback to spawn objects
  private spawnCallback: (args: SpawnArgs) => SpawnedObject | undefined;
  private onObjectSpawnedCallbacks: ((entity: Entity) => void)[] = [];

  constructor(args: {
    id: Entity;
    scene: PrimodiumScene;
    spawnCallback: (args: SpawnArgs) => SpawnedObject | undefined;
    register?: boolean;
  }) {
    const { id, scene, spawnCallback, register = true } = args;
    this.id = id;
    this._scene = scene;
    this.spawnCallback = spawnCallback;

    if (register) this.register();
  }

  register() {
    this._scene.objects.deferredRenderContainer.addContainer(this.id, this);
  }

  add(entity: Entity, coord: Coord, spawnArgs: SpawnArgs) {
    this.objects.set(entity, spawnArgs);

    const chunkCoord = this._scene.utils.tileCoordToChunkCoord({ x: coord.x, y: -coord.y });
    const chunkCoordKey = this._getKeyForChunk(chunkCoord);
    if (this._scene.utils.getVisibleChunks().has(chunkCoordKey) && !this.isSpawned(entity)) {
      this.spawn(entity);
      return;
    }

    const entities = this.chunkCoords.get(chunkCoordKey) ?? [];
    entities.push(entity);
    this.chunkCoords.set(this._getKeyForChunk(chunkCoord), entities);
  }

  updatePosition(entity: Entity, coord: Coord) {
    const spawnArgs = this.objects.get(entity);
    if (!spawnArgs) return;

    const oldCoord = spawnArgs.coord;
    const oldChunkCoord = this._scene.utils.tileCoordToChunkCoord({ x: oldCoord.x, y: -oldCoord.y });

    // find in maping and remove
    const entities = this.chunkCoords.get(this._getKeyForChunk(oldChunkCoord)) ?? [];
    const index = entities.indexOf(entity);
    if (index !== -1) entities.splice(index, 1);
    this.chunkCoords.set(this._getKeyForChunk(oldChunkCoord), entities);

    // just re-add to trigger the spawn if needed
    this.add(entity, coord, { ...spawnArgs, coord });
  }

  spawn(entity: Entity) {
    const spawnArgs = this.objects.get(entity);
    if (!spawnArgs) return undefined;

    const obj = this.spawnCallback(spawnArgs);
    if (!obj) return undefined;

    // we need to manually spawn and set the object, since at this point (during `onEnterChunk`) the visible chunks were not yet updated
    // meaning that it might not consider it visible yet, so it won't actually enter it
    if (!obj.isSpawned()) obj.spawn();
    obj.setActive(true).setVisible(true);

    this.spawned.set(entity, true);
    this.objects.delete(entity);

    this.onObjectSpawnedCallbacks.forEach((callback) => callback(entity));

    return obj;
  }

  isSpawned(entity: Entity) {
    return this.spawned.get(entity) ?? false;
  }

  protected _getKeyForChunk({ x, y }: Coord): string {
    return `${x}:${y}`;
  }

  onNewEnterChunk(coord: Coord) {
    const entities = this.chunkCoords.get(this._getKeyForChunk(coord)) ?? [];
    entities.forEach((entity) => {
      if (!this.isSpawned(entity)) this.spawn(entity as Entity);
    });
  }

  // onEnterChunk(coord: Coord) {}
  // onExitChunk(coord: Coord) {}

  onObjectSpawned(callback: (entity: Entity) => void) {
    this.onObjectSpawnedCallbacks.push(callback);

    return () => {
      const index = this.onObjectSpawnedCallbacks.indexOf(callback);
      if (index !== -1) this.onObjectSpawnedCallbacks.splice(index, 1);
    };
  }

  destroy() {}
}
