import { Scene } from "engine/types";
import { Bounds, Dimensions, ResourceTile, isOutOfBounds } from "./helpers";
import { DepthLayers, EntityTypeToTilesetKey, Tilesets } from "src/game/lib/mappings";

export class AsteroidResources {
  private scene: Scene;
  private maxBounds?: Bounds;
  private resourcesMap?: Phaser.Tilemaps.Tilemap;
  private asteroidDimensions: Dimensions;

  constructor(scene: Scene, asteroidDimensions: Dimensions) {
    this.scene = scene;
    this.asteroidDimensions = asteroidDimensions;
  }

  draw(tiles: ResourceTile[], maxBounds: Bounds) {
    if (!this.resourcesMap) {
      this.resourcesMap = this.scene.phaserScene.add.tilemap(
        undefined,
        this.scene.tiled.tileWidth,
        this.scene.tiled.tileHeight,
        this.asteroidDimensions.xBounds,
        this.asteroidDimensions.yBounds
      );
    }

    const tileset = this.resourcesMap.addTilesetImage(Tilesets.Resource);
    if (!tileset) return this;

    this.resourcesMap.removeAllLayers();
    this.resourcesMap
      ?.createBlankLayer(Tilesets.Resource, tileset, 0, -this.asteroidDimensions.yBounds * this.scene.tiled.tileHeight)
      ?.setDepth(DepthLayers.Resources);

    tiles.forEach((tile) => {
      const { id, x, y } = tile;

      if (isOutOfBounds({ x, y }, maxBounds)) return this;
      this.resourcesMap?.putTileAt(EntityTypeToTilesetKey[id], x, this.asteroidDimensions.yBounds - y);
    });

    return this;
  }

  dispose() {
    this.resourcesMap?.destroy();
    this.resourcesMap = undefined;
  }
}
