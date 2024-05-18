import { Entity } from "@latticexyz/recs";
import { Coord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { BaseSpawnArgs, DeferredRenderContainer } from "@/game/lib/objects/DeferredRenderContainer";
import { FleetsContainer } from "@/game/lib/objects/Asteroid/FleetsContainer";
import { BaseAsteroid } from "@/game/lib/objects/Asteroid/BaseAsteroid";
import { ShardAsteroid } from "@/game/lib/objects/Asteroid/ShardAsteroid";

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
    super(args);
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
      asteroid.explode(newPosition);

      // update position internally (chunk coords)
      this.updatePosition(entity, newPosition);
      // let the static objects manager know as well for visibility
      const pixelCoord = this._scene.utils.tileCoordToPixelCoord(newPosition);
      this._scene.objects.asteroid.updatePosition(entity, { x: pixelCoord.x, y: -pixelCoord.y });

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
      .has(this._getKeyForChunk({ x: newPosChunkCoord.x, y: -newPosChunkCoord.y }));
    if (isNowVisible) {
      (this.asteroids.get(entity) as ShardAsteroid)?.respawn(newPosition);
    }
  }
}
