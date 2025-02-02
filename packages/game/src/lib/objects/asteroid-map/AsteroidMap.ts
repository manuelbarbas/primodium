import Phaser from "phaser";

import { MaxLevelToTilemap } from "@game/lib/mappings";
import { AsteroidBounds } from "@game/lib/objects/asteroid-map/AsteroidBounds";
import { AsteroidResources } from "@game/lib/objects/asteroid-map/AsteroidResources";
import { Bounds, Dimensions, ResourceTile } from "@game/lib/objects/asteroid-map/helpers";
import { PrimodiumScene } from "@game/types";

export class AsteroidMap {
  private scene: PrimodiumScene;
  private asteroidTiledMap?: Phaser.Tilemaps.Tilemap;

  private bounds: AsteroidBounds;
  private resources: AsteroidResources;

  private currentBounds?: Bounds;
  private maxBounds?: Bounds;
  private asteroidDimensions: Dimensions;

  constructor(scene: PrimodiumScene, asteroidDimensions: Dimensions) {
    this.scene = scene;
    this.asteroidDimensions = asteroidDimensions;
    this.bounds = new AsteroidBounds(scene, asteroidDimensions);
    this.resources = new AsteroidResources(scene, asteroidDimensions);
  }

  drawMap(maxLevel: bigint) {
    this.asteroidTiledMap?.destroy();
    this.asteroidTiledMap = this.scene.tiled.render(MaxLevelToTilemap[Number(maxLevel)]!);
    return this;
  }

  drawBounds(currentBounds: Bounds, maxBounds: Bounds) {
    this.currentBounds = currentBounds;
    this.maxBounds = maxBounds;
    this.bounds.draw(currentBounds, maxBounds);
    return this;
  }

  drawResources(tiles: ResourceTile[], maxBounds?: Bounds) {
    if (!this.maxBounds) {
      console.warn(
        "AsteroidMap.drawResources: maxBounds was not initially set. Either manually set or drawBounds first",
      );
      return this;
    }

    if (maxBounds) {
      this.maxBounds = maxBounds;
    }

    this.resources.draw(tiles, this.maxBounds);
    return this;
  }

  getTilemapBounds() {
    return this.asteroidTiledMap?.layer.tilemapLayer.getBounds();
  }

  getCurrentBounds() {
    return this.currentBounds;
  }

  getMaxBounds() {
    return this.maxBounds;
  }

  dispose() {
    this.asteroidTiledMap?.destroy();
    this.resources.dispose();
    this.bounds.dispose();
  }
}
