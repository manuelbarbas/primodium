import { Entity } from "@latticexyz/recs";
import { Coord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { BaseSpawnArgs, DeferredRenderContainer } from "@/game/lib/objects/DeferredRenderContainer";
import { FleetsContainer } from "@/game/lib/objects/Asteroid/FleetsContainer";
import { BaseAsteroid } from "@/game/lib/objects/Asteroid/BaseAsteroid";
import { ShardAsteroid } from "@/game/lib/objects/Asteroid/ShardAsteroid";
import { components } from "@/network/components";
import { Mode } from "@/util/constants";

type AsteroidSpawnArgs = BaseSpawnArgs & {
  spawnsSecondary: boolean;
};

export class DeferredAsteroidsRenderContainer extends DeferredRenderContainer<BaseAsteroid, AsteroidSpawnArgs> {
  private asteroids: Map<Entity, BaseAsteroid> = new Map();
  protected fleetsContainers: Map<string, FleetsContainer> = new Map();
  protected isShard: boolean = false;

  constructor(args: {
    id: Entity;
    scene: PrimodiumScene;
    spawnCallback: (args: AsteroidSpawnArgs) => BaseAsteroid | undefined;
    isShard?: boolean;
  }) {
    super({ ...args, objectApiType: "asteroid" });
    this.isShard = args.isShard ?? false;
  }

  add(entity: Entity, coord: Coord, spawnArgs: AsteroidSpawnArgs) {
    super.add(entity, coord, spawnArgs);

    // register the fleets container so the asteroid can grab it when spawning
    const pixelCoord = this._scene.utils.tileCoordToPixelCoord(coord);
    this.fleetsContainers.set(entity, new FleetsContainer(this._scene, { x: pixelCoord.x, y: -pixelCoord.y }));
  }

  spawn(entity: Entity) {
    const asteroid = super.spawn(entity);
    if (asteroid) this.asteroids.set(entity, asteroid);
    return asteroid;
  }

  getFleetsContainers(entity: Entity) {
    // in case it's accessed after the object was spawned
    const obj = this._scene.objects.asteroid.get(entity);
    if (obj) return obj.getFleetsContainer();

    return this.fleetsContainers.get(entity);
  }

  // only for shards
  explode(entity: Entity, newPosition: Coord) {
    const asteroid = this._scene.objects.asteroid.get(entity) as ShardAsteroid;

    // if it's already spawned into visibility, just explode it and update its position
    if (asteroid) {
      asteroid.explode(
        newPosition,
        // on animation complete
        () => {
          // update position internally (chunk coords)
          this.updatePosition(entity, newPosition);
        }
      );

      return;
    }

    // in this case it doesn't exist, so if it becomes visible it will also spawn it, etc
    this.updatePosition(entity, newPosition);
    // clear out orbiting fleets, as the container is still holding them for this asteroid
    this.getFleetsContainers(entity)?.clearOrbit();
    // we also want to trigger the respawn animation if it becomes in sight
    const newPosChunkCoord = this._scene.utils.tileCoordToChunkCoord(newPosition);
    const isNowVisible = this._scene.utils
      .getVisibleChunks()
      .has(this._scene.utils.encodeKeyForChunk({ x: newPosChunkCoord.x, y: -newPosChunkCoord.y }));
    if (isNowVisible) {
      (this.asteroids.get(entity) as ShardAsteroid)?.respawn(newPosition);
    }
  }

  onEnterChunk(chunkCoord: Coord): void {
    const entities = this.chunkCoords.get(this._scene.utils.encodeKeyForChunk(chunkCoord)) ?? [];
    const currentAsteroids = components.VisibleAsteroids.get(Mode.Starmap)?.value ?? [];
    components.VisibleAsteroids.set({ value: [...currentAsteroids, ...entities] }, Mode.Starmap);
  }

  onExitChunk(chunkCoord: Coord): void {
    const entities = this.chunkCoords.get(this._scene.utils.encodeKeyForChunk(chunkCoord)) ?? [];
    const currentAsteroids = components.VisibleAsteroids.get(Mode.Starmap)?.value ?? [];
    components.VisibleAsteroids.set(
      { value: currentAsteroids.filter((entity) => !entities.includes(entity)) },
      Mode.Starmap
    );
  }
}
