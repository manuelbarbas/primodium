import { DepthLayers, MaxLevelToTilemap, ResourceToTilesetKey, Tilesets } from "@game/constants";
import { Coord, Scene } from "engine/types";

type Dimensions = {
  xBounds: number;
  yBounds: number;
};

type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

type ResourceTile = {
  id: number;
  x: number;
  y: number;
};

function getRelativeCoord(coord: Coord, maxBounds: Bounds) {
  return {
    x: coord.x - maxBounds.minX,
    y: coord.y - maxBounds.minY,
  };
}

function isOutOfBounds(coord: Coord, bounds: Bounds) {
  return coord.x >= bounds.maxX || coord.x < bounds.minX || coord.y >= bounds.maxY || coord.y < bounds.minY;
}

export class AsteroidMap {
  private scene: Scene;
  private asteroidTiledMap?: Phaser.Tilemaps.Tilemap;
  private resourcesMap?: Phaser.Tilemaps.Tilemap;
  private boundsMap?: Phaser.Tilemaps.Tilemap;
  private currentBounds?: Bounds;
  private maxBounds?: Bounds;
  private asteroidDimensions: Dimensions;

  constructor(scene: Scene, asteroidDimensions: Dimensions) {
    this.scene = scene;
    this.asteroidDimensions = asteroidDimensions;
  }

  getAsteroidTiledMap() {
    return this.asteroidTiledMap;
  }

  getResoucesMap() {
    return this.resourcesMap;
  }

  drawMap(maxLevel: bigint) {
    this.asteroidTiledMap?.destroy();
    this.asteroidTiledMap = this.scene.tiled.render(MaxLevelToTilemap[Number(maxLevel)]);
    return this;
  }

  drawBounds(currentBounds: Bounds, maxBounds: Bounds) {
    this.currentBounds = currentBounds;
    this.maxBounds = maxBounds;
    const tileWidth = this.scene.tiled.tileWidth;
    const tileHeight = this.scene.tiled.tileHeight;

    //SETUP TILEMAP
    if (!this.boundsMap) {
      this.boundsMap = this.scene.phaserScene.add.tilemap(
        undefined,
        tileWidth,
        tileHeight,
        this.asteroidDimensions.xBounds,
        this.asteroidDimensions.yBounds
      );
    }

    //SETUP TILESETS
    const outerBorderTileset = this.boundsMap.addTilesetImage(
      Tilesets.BoundsOuterBorder,
      undefined,
      tileWidth,
      tileHeight,
      1,
      2
    );

    const innerBorderTileset = this.boundsMap.addTilesetImage(
      Tilesets.BoundsInnerBorder,
      undefined,
      tileWidth,
      tileHeight,
      1,
      2
    );

    const nonBuildableTileset = this.boundsMap.addTilesetImage(
      Tilesets.BoundsNonBuildable,
      undefined,
      tileWidth,
      tileHeight,
      1,
      2
    );

    if (!outerBorderTileset || !nonBuildableTileset || !innerBorderTileset) return this;

    this.boundsMap.removeAllLayers();

    //SETUP LAYERS
    const maxBoundsStart = getRelativeCoord({ x: this.maxBounds.minX, y: this.maxBounds.minY }, this.maxBounds);
    const maxBoundsEnd = getRelativeCoord({ x: this.maxBounds.maxX, y: this.maxBounds.maxY }, this.maxBounds);
    const currentBoundsStart = getRelativeCoord(
      { x: this.currentBounds.minX, y: this.currentBounds.minY },
      this.maxBounds
    );
    const currentBoundsEnd = getRelativeCoord(
      { x: this.currentBounds.maxX, y: this.currentBounds.maxY },
      this.maxBounds
    );
    const layerX = maxBounds.minX * this.scene.tiled.tileWidth;
    const layerY = (-maxBounds.maxY + 1) * this.scene.tiled.tileHeight;
    const width = maxBoundsEnd.x - maxBoundsStart.x;
    const height = maxBoundsEnd.y - maxBoundsStart.y;

    const innerBorderLayer = this.boundsMap
      .createBlankLayer("innerBorders", innerBorderTileset, layerX, layerY, width, height)
      ?.setDepth(DepthLayers.Bounds);

    const nonBuildableLayer = this.boundsMap
      .createBlankLayer("nonBuildable", nonBuildableTileset, layerX, layerY, width, height)
      ?.setDepth(DepthLayers.Bounds);

    const outerBordersLayer = this.boundsMap
      .createBlankLayer("borders", outerBorderTileset, layerX, layerY, width, height)
      ?.setDepth(DepthLayers.Bounds);

    if (!outerBordersLayer || !nonBuildableLayer || !innerBorderLayer) return this;

    //DRAW LAYERS
    for (let x = maxBoundsStart.x; x < maxBoundsEnd.x; x++) {
      for (let y = maxBoundsStart.x; y < maxBoundsEnd.y; y++) {
        //outer border
        if (x === maxBoundsStart.x || x === maxBoundsEnd.x - 1 || y === maxBoundsStart.y || y === maxBoundsEnd.y - 1) {
          let tileId = 9;

          switch (true) {
            //top left corner
            case x === maxBoundsStart.y && y === 0:
              tileId = 1;
              break;
            //top right corner
            case x === maxBoundsEnd.x - 1 && y === maxBoundsStart.y:
              tileId = 3;
              break;
            //bottom left corner
            case x === maxBoundsStart.x && y === maxBoundsEnd.y - 1:
              tileId = 6;
              break;
            //bottom right corner
            case x === maxBoundsEnd.x - 1 && y === maxBoundsEnd.y - 1:
              tileId = 8;
              break;
            // top tile
            case y === maxBoundsStart.y:
              tileId = 2;
              break;
            case x === maxBoundsStart.x:
              tileId = 4;
              break;
            case x === maxBoundsEnd.x - 1:
              tileId = 5;
              break;
            case y === maxBoundsEnd.y - 1:
              tileId = 7;
              break;
          }

          outerBordersLayer.putTileAt(tileId, x, y);
        }

        if (
          x >= currentBoundsStart.x - 1 &&
          x <= currentBoundsEnd.x &&
          y >= currentBoundsStart.y - 1 &&
          y <= currentBoundsEnd.y
        ) {
          switch (true) {
            case x === currentBoundsStart.x - 1 && y === currentBoundsStart.y - 1:
              innerBorderLayer.putTileAt(0, x, y);
              break;
            case x === currentBoundsEnd.x && y === currentBoundsStart.y - 1:
              innerBorderLayer.putTileAt(0, x, y);
              break;
            case x === currentBoundsStart.x - 1 && y === currentBoundsEnd.y:
              innerBorderLayer.putTileAt(0, x, y);
              break;
            case x === currentBoundsEnd.x && y === currentBoundsEnd.y:
              innerBorderLayer.putTileAt(0, x, y);
              break;
            case x === currentBoundsStart.x - 1:
              innerBorderLayer.putTileAt(1, x, y);
              break;
            case x === currentBoundsEnd.x:
              innerBorderLayer.putTileAt(2, x, y);
              break;
            case y === currentBoundsStart.y - 1:
              innerBorderLayer.putTileAt(3, x, y);
              break;
            case y === currentBoundsEnd.y:
              innerBorderLayer.putTileAt(4, x, y);
              break;

            default:
              continue;
          }
        }

        //normal tiles
        nonBuildableLayer.putTileAt(2, x, y);
      }
    }
    nonBuildableLayer.setAlpha(0.8);

    //EFFECTS
    const glowEffect = outerBordersLayer.postFX.addGlow(0x008b8b, 4, 0, false, 0.05, 30);
    this.scene.phaserScene.tweens.add({
      targets: nonBuildableLayer,
      alpha: { from: 0.8, to: 0.5 },
      duration: 3000,
      ease: Phaser.Math.Easing.Sine.InOut,
      yoyo: true,
      repeat: -1,
    });

    this.scene.phaserScene.tweens.add({
      targets: glowEffect,
      outerStrength: 0.5,
      duration: 3000,
      ease: Phaser.Math.Easing.Sine.InOut,
      yoyo: true,
      repeat: -1,
    });

    nonBuildableLayer.postFX.addVignette(0.5, 0.5, 3, 1);

    return this;
  }

  drawResources(tiles: ResourceTile[]) {
    if (!this.maxBounds) {
      console.error("Max bounds not set. drawBounds must be called before drawResources.");
      return this;
    }

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

      if (isOutOfBounds({ x, y }, this.maxBounds!)) return this;
      this.resourcesMap?.putTileAt(ResourceToTilesetKey[id], x, this.asteroidDimensions.yBounds - y);
    });

    return this;
  }

  dispose() {
    this.asteroidTiledMap?.destroy();
    this.asteroidTiledMap?.destroy();
    this.resourcesMap?.destroy();
    this.boundsMap?.destroy();
  }
}
