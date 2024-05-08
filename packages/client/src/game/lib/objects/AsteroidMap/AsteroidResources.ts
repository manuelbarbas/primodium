import { SceneApi } from "@/game/api/scene";
import { Bounds, Dimensions, ResourceTile, isOutOfBounds } from "./helpers";
import { EntityTypeToResourceTilekey } from "src/game/lib/mappings";
import { DepthLayers } from "../../constants/common";
import { Tilesets } from "@primodiumxyz/assets";

export class AsteroidResources {
  private scene: SceneApi;
  private maxBounds?: Bounds;
  private resourcesMap?: Phaser.Tilemaps.Tilemap;
  private asteroidDimensions: Dimensions;

  constructor(scene: SceneApi, asteroidDimensions: Dimensions) {
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
      const { resourceType, x, y } = tile;

      if (isOutOfBounds({ x, y }, maxBounds)) return this;
      this.resourcesMap?.putTileAt(EntityTypeToResourceTilekey[resourceType], x, this.asteroidDimensions.yBounds - y);
    });

    return this;
  }

  dispose() {
    this.resourcesMap?.destroy();
    this.resourcesMap = undefined;
  }
}
