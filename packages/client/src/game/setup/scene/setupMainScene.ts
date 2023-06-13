import {
  createCamera,
  getSceneLoadPromise,
} from "@smallbraingames/small-phaser";
import { createPerlin } from "@latticexyz/noise";

import { GameConfig, TerrainTileset } from "../../../util/types";
import createGameTilemap from "../../helpers/createGameTilemap";
import { getTopLayerKeyPair } from "../../../util/tile";
import { EntityIdtoTilesetId } from "../../../util/constants";

const setupMainScene = async (scene: Phaser.Scene, config: GameConfig) => {
  await getSceneLoadPromise(scene);

  const {
    camera: { minZoom, maxZoom, pinchSpeed, scrollSpeed },
    assetKeys: {
      tilesets: { resource: resourceKey, terrain: terrainKey },
    },
    tilemap: { gridSize, tileHeight, tileWidth },
  } = config;

  /* ----------------------------- Create Tilemaps ---------------------------- */
  const terrainTilemap = createGameTilemap(
    scene,
    terrainKey,
    tileWidth,
    tileHeight,
    gridSize
  );

  const resourceTilemap = createGameTilemap(
    scene,
    resourceKey,
    tileWidth,
    tileHeight,
    gridSize
  );

  /* ------------------------------ Setup Camera ------------------------------ */
  const camera = createCamera(
    scene.cameras.main,
    minZoom,
    maxZoom,
    pinchSpeed,
    scrollSpeed
  );

  /* ---------------------- Render Resources and Terrain ---------------------- */
  const perlin = await createPerlin();

  const halfGridSize = gridSize / 2;
  for (let x = -halfGridSize; x < halfGridSize; x++) {
    for (let y = -halfGridSize; y < halfGridSize; y++) {
      const coord = { x, y };
      const { terrain, resource } = getTopLayerKeyPair(coord, perlin);

      //lookup and place terrain
      const terrainId = EntityIdtoTilesetId[terrain];
      terrainTilemap.putTileAt(terrainId ?? TerrainTileset.Alluvium, {
        x,
        y,
      });

      //lookup and place resource
      if (!resource) continue;
      const resourceId = EntityIdtoTilesetId[resource];
      resourceTilemap.putTileAt(resourceId, { x, y });
    }
  }

  return {
    scene,
    config,
    terrainTilemap,
    resourceTilemap,
    camera,
  };
};

export default setupMainScene;
