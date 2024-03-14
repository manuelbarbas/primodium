import { MaxLevelToTilemap, ResourceToTilesetKey } from "@game/constants";
import { Scene } from "engine/types";

type Dimensions = {
  xBounds: number;
  yBounds: number;
};

type ResourceTile = {
  id: number;
  x: number;
  y: number;
};

export class AsteroidMap {
  private scene: Scene;
  private asteroidTiledMap: Phaser.Tilemaps.Tilemap | undefined;
  private resourcesMap: Phaser.Tilemaps.Tilemap | undefined;
  private currentDims: Dimensions | undefined;
  private maxDims: Dimensions | undefined;
  constructor(scene: Scene, maxLevel: bigint) {
    this.scene = scene;
    this.setMap(maxLevel);
  }

  getAsteroidTiledMap() {
    return this.asteroidTiledMap;
  }

  getResoucesMap() {
    return this.resourcesMap;
  }

  setMap(maxLevel: bigint) {
    this.asteroidTiledMap = this.scene.tiled.render(MaxLevelToTilemap[Number(maxLevel)]);
    this.resourcesMap = undefined;
    this.currentDims = undefined;
    this.maxDims = undefined;
    return this;
  }

  setBounds(currentDims: Dimensions, maxDims: Dimensions) {
    this.currentDims = currentDims;
    this.maxDims = maxDims;
    return this;
  }

  setResources(tiles: ResourceTile[]) {
    const { currentDims, maxDims } = this;
    if (!currentDims || !maxDims) throw new Error("Buildable Bounds not set for asteroid map");

    if (!this.resourcesMap)
      this.resourcesMap = this.scene.phaserScene.add.tilemap(
        undefined,
        this.scene.tiled.tileWidth,
        this.scene.tiled.tileHeight,
        maxDims.xBounds,
        maxDims.yBounds
      );

    tiles.forEach((tile) => {
      const { id, x, y } = tile;
      if (x > currentDims.xBounds || y > currentDims.yBounds) return;
      this.resourcesMap?.putTileAt(ResourceToTilesetKey[id], x, maxDims.yBounds - y);
    });

    return this;
  }

  dispose() {
    this.scene.tiled.dispose();
  }
}
