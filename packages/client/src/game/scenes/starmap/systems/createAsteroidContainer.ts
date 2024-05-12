import { Entity } from "@latticexyz/recs";
import { Coord, Scene } from "engine/types";
import { initializeSecondaryAsteroids } from "./utils/initializeSecondaryAsteroids";
import { renderAsteroid } from "@/game/lib/render/renderAsteroid";
import { IPrimodiumGameObject } from "@/game/lib/objects/interfaces";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { hashEntities } from "@/util/encode";
import { toHex } from "viem";

// Create a wrapper for the future asteroid at its coord, to prevent rendering it on launch and causing stutter
// This will be called in the enter system (basically on initial load), create this basic object at the coords, which when
// entering the visible chunk will be spawned, effectively creating the actual asteroid, which will be rendered as well
// This is nothing more than delaying the creation of the asteroid to the first time it needs to be rendered
class AsteroidContainer extends Phaser.GameObjects.Container implements IPrimodiumGameObject {
  private id: Entity;
  private containerId: Entity;
  private coord: Coord;
  private _scene: Scene;
  private spawnsSecondary: boolean;
  private spawned = false;

  constructor(args: { id: Entity; scene: Scene; coord: Coord; spawnsSecondary: boolean }) {
    const { id, scene, coord, spawnsSecondary } = args;
    const pixelCoord = tileCoordToPixelCoord(coord, scene.tiled.tileWidth, scene.tiled.tileHeight);
    super(scene.phaserScene, pixelCoord.x, -pixelCoord.y);

    const containerId = hashEntities(toHex("container"), id);
    this.id = id;
    this.containerId = containerId;
    this.coord = coord;
    this._scene = scene;
    this.spawnsSecondary = spawnsSecondary;

    this._scene.objects.add(containerId, this, true);
  }

  spawn() {
    renderAsteroid({
      scene: this._scene,
      entity: this.id,
      coord: this.coord,
      addEventHandlers: true,
    });

    if (this.spawnsSecondary) initializeSecondaryAsteroids(this.id, this.coord);
  }

  isSpawned() {
    return this.spawned;
  }
}

export const createAsteroidContainer = (args: {
  scene: Scene;
  entity: Entity;
  coord: Coord;
  spawnsSecondary: boolean;
}) => {
  const { scene, entity, coord, spawnsSecondary } = args;
  return new AsteroidContainer({ id: entity, scene, coord, spawnsSecondary });
};
