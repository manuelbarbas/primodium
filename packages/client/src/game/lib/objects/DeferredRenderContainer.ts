import { Entity } from "@latticexyz/recs";
import { Coord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { PrimodiumObjectApi, PrimodiumObjectApiMap } from "@/game/api/objects";
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
 * Note: it's good practice to always try to interact with the container if an object _could_ have been deferred; it will redirect either to the object directly if it exists, or perform the operation
 * on the container if it doesn't. Even if the object was directly rendered and has absolutely no knowledge of the container.
 *
 * @param args.id A unique id for the container
 * @param args.scene The Primodium scene object
 * @param args.objectApiType The key in the {@link PrimodiumObjectApiMap} to redirect to the associated {@link PrimodiumScene.objects}
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
  protected _objectApi: PrimodiumObjectApi<SpawnedObject>;
  // shared callback to spawn objects
  private spawnCallback: (args: SpawnArgs) => SpawnedObject | undefined;
  private onObjectSpawnedCallbacks: ((entity: Entity) => void)[] = [];

  constructor(args: {
    id: Entity;
    scene: PrimodiumScene;
    objectApiType: keyof Omit<PrimodiumObjectApiMap, "deferredRenderContainer">;
    spawnCallback: (args: SpawnArgs) => SpawnedObject | undefined;
    register?: boolean;
  }) {
    const { id, scene, objectApiType, spawnCallback, register = true } = args;
    this.id = id;
    this._scene = scene;
    this._objectApi = scene.objects[objectApiType] as unknown as PrimodiumObjectApi<SpawnedObject>;
    this.spawnCallback = spawnCallback;

    if (register) this.register();
  }

  register() {
    this._scene.objects.deferredRenderContainer.addContainer(this.id, this);
  }

  add(entity: Entity, coord: Coord, spawnArgs: SpawnArgs) {
    this.objects.set(entity, spawnArgs);

    const chunkCoord = this._scene.utils.tileCoordToChunkCoord({ x: coord.x, y: -coord.y });
    const chunkCoordKey = this.encodeKeyForChunk(chunkCoord);
    if (this._scene.utils.getVisibleChunks().has(chunkCoordKey) && !this.isSpawned(entity)) {
      this.spawn(entity);
      return;
    }

    const entities = this.chunkCoords.get(chunkCoordKey) ?? [];
    entities.push(entity);
    this.chunkCoords.set(this.encodeKeyForChunk(chunkCoord), entities);
  }

  updatePosition(entity: Entity, coord: Coord) {
    const spawnArgs = this.objects.get(entity);
    if (!spawnArgs) return;

    const oldCoord = spawnArgs.coord;
    if (oldCoord === coord) return;

    const oldChunkCoord = this._scene.utils.tileCoordToChunkCoord({ x: oldCoord.x, y: -oldCoord.y });
    const newChunkCoord = this._scene.utils.tileCoordToChunkCoord({ x: coord.x, y: -coord.y });

    // update mapping
    const oldChunkEntities = this.chunkCoords.get(this.encodeKeyForChunk(oldChunkCoord)) ?? [];
    const index = oldChunkEntities.indexOf(entity);
    if (index !== -1) oldChunkEntities.splice(index, 1);
    const newChunkEntities = this.chunkCoords.get(this.encodeKeyForChunk(newChunkCoord)) ?? [];
    newChunkEntities.push(entity);
    this.chunkCoords.set(this.encodeKeyForChunk(oldChunkCoord), oldChunkEntities);
    this.chunkCoords.set(this.encodeKeyForChunk(newChunkCoord), newChunkEntities);

    // update args
    spawnArgs.coord = coord;
    this.objects.set(entity, spawnArgs);

    // if it's already spawned, update its position in the static object manager
    const obj = this._objectApi.get(entity);
    if (obj) {
      const pixelCoord = this._scene.utils.tileCoordToPixelCoord(coord);
      this._objectApi.updatePosition(entity, { x: pixelCoord.x, y: -pixelCoord.y });
    } else {
      // if it's not spawned, we should check if it's now visible and spawn it
      if (this._scene.utils.getVisibleChunks().has(this.encodeKeyForChunk(newChunkCoord))) {
        this.spawn(entity);
      }
    }
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

  onNewEnterChunk(coord: Coord) {
    const entities = this.chunkCoords.get(this.encodeKeyForChunk(coord)) ?? [];
    entities.forEach((entity) => {
      if (!this.isSpawned(entity)) this.spawn(entity as Entity);
    });
  }

  // TODO: we're using this in the upcoming PR
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onEnterChunk(_: Coord) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onExitChunk(_: Coord) {}

  onObjectSpawned(callback: (entity: Entity) => void) {
    this.onObjectSpawnedCallbacks.push(callback);

    return () => {
      const index = this.onObjectSpawnedCallbacks.indexOf(callback);
      if (index !== -1) this.onObjectSpawnedCallbacks.splice(index, 1);
    };
  }

  destroy() {}

  protected encodeKeyForChunk({ x, y }: Coord): string {
    return `${x}:${y}`;
  }
}
