import { Entity } from "@latticexyz/recs";
import { Coord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { renderAsteroid } from "@/game/lib/render/renderAsteroid";
import { initializeSecondaryAsteroids } from "@/game/scenes/starmap/systems/utils/initializeSecondaryAsteroids";
import { DeferredRenderContainer } from "@/game/lib/objects/DeferredRenderContainer";
import { FleetsContainer } from "@/game/lib/objects/Asteroid/FleetsContainer";
import { BaseAsteroid } from "@/game/lib/objects/Asteroid/BaseAsteroid";

export class DeferredAsteroidRenderContainer extends DeferredRenderContainer<BaseAsteroid> {
  protected asteroid: BaseAsteroid | undefined;
  protected fleetsContainer: FleetsContainer;

  constructor(args: {
    id: Entity;
    scene: PrimodiumScene;
    coord: Coord;
    spawnCallback: () => BaseAsteroid | undefined;
    render: () => BaseAsteroid | undefined;
  }) {
    super({ ...args, register: false });
    this.fleetsContainer = new FleetsContainer(args.scene, { x: 0, y: 0 });
    this.register();
  }

  spawn() {
    const asteroid = super.spawn();
    this.asteroid = asteroid as BaseAsteroid | undefined;

    return asteroid;
  }

  getFleetsContainer() {
    return this.fleetsContainer;
  }
}

export const renderDeferredAsteroid = (args: {
  scene: PrimodiumScene;
  entity: Entity;
  coord: Coord;
  spawnsSecondary: boolean;
}) => {
  const { scene, entity, coord, spawnsSecondary } = args;
  const render = () =>
    renderAsteroid({
      scene,
      entity,
      coord,
      addEventHandlers: true,
    });

  const spawnCallback = () => {
    const asteroid = render();
    if (spawnsSecondary) initializeSecondaryAsteroids(entity, coord);

    return asteroid;
  };

  return new DeferredAsteroidRenderContainer({ id: entity, scene, coord, spawnCallback, render });
};
