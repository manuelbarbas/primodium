import { Entity } from "@latticexyz/recs";
import { Coord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { renderShardAsteroid } from "@/game/lib/render/renderShardAsteroid";
import { DeferredRenderContainer } from "@/game/lib/objects/DeferredRenderContainer";
import { FleetsContainer } from "@/game/lib/objects/Asteroid/FleetsContainer";
import { ShardAsteroid } from "@/game/lib/objects/Asteroid/ShardAsteroid";

export class DeferredShardAsteroidRenderContainer extends DeferredRenderContainer<ShardAsteroid> {
  protected asteroid: ShardAsteroid | undefined;
  protected fleetsContainer: FleetsContainer;

  constructor(args: {
    id: Entity;
    scene: PrimodiumScene;
    coord: Coord;
    spawnCallback: () => ShardAsteroid | undefined;
    render: () => ShardAsteroid | undefined;
  }) {
    super({ ...args, register: false });
    this.fleetsContainer = new FleetsContainer(args.scene, { x: 0, y: 0 });
    this.register();
  }

  spawn() {
    const asteroid = super.spawn();
    this.asteroid = asteroid as ShardAsteroid | undefined;

    return asteroid;
  }

  getFleetsContainer() {
    return this.fleetsContainer;
  }

  setTilePosition(coord: Coord) {
    this.asteroid?.setTilePosition(coord);
    this.coord = coord;
    const pixelCoord = this._scene.utils.tileCoordToPixelCoord(coord);
    this.setPosition(pixelCoord.x, -pixelCoord.y);
    return this;
  }
}

export const renderDeferredShardAsteroid = (args: { scene: PrimodiumScene; entity: Entity; coord: Coord }) => {
  const { scene, entity, coord } = args;

  const render = () => renderShardAsteroid({ scene, entity, addEventHandlers: true, coord });
  const spawnCallback = () => render();

  return new DeferredShardAsteroidRenderContainer({ id: entity, scene, coord, spawnCallback, render });
};
