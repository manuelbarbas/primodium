import { MaxLevelToTilemap } from "@game/constants";
import { Scene } from "engine/types";
import { Bounds, Dimensions, ResourceTile } from "./helpers";
import { AsteroidBounds } from "./AsteroidBounds";
import { AsteroidResources } from "./AsteroidResources";

export class AsteroidMap {
  private scene: Scene;
  private asteroidTiledMap?: Phaser.Tilemaps.Tilemap;

  private bounds: AsteroidBounds;
  private resources: AsteroidResources;

  private currentBounds?: Bounds;
  private maxBounds?: Bounds;
  private asteroidDimensions: Dimensions;

  constructor(scene: Scene, asteroidDimensions: Dimensions) {
    this.scene = scene;
    this.asteroidDimensions = asteroidDimensions;
    this.bounds = new AsteroidBounds(scene, asteroidDimensions);
    this.resources = new AsteroidResources(scene, asteroidDimensions);
  }

  drawMap(maxLevel: bigint) {
    this.asteroidTiledMap?.destroy();
    this.asteroidTiledMap = this.scene.tiled.render(MaxLevelToTilemap[Number(maxLevel)]);
    return this;
  }

  drawBounds(currentBounds: Bounds, maxBounds: Bounds) {
    this.maxBounds = maxBounds;
    this.bounds.draw(currentBounds, maxBounds);
    return this;
  }

  drawResources(tiles: ResourceTile[], maxBounds?: Bounds) {
    if (!this.maxBounds) {
      console.warn(
        "AsteroidMap.drawResources: maxBounds was not initially set. Either manually set or drawBounds first"
      );
      return this;
    }

    if (maxBounds) {
      this.maxBounds = maxBounds;
    }

    this.resources.draw(tiles, this.maxBounds);
    return this;
  }

  dispose() {
    this.asteroidTiledMap?.destroy();
    this.resources.dispose();
    this.bounds.dispose();
  }
}
