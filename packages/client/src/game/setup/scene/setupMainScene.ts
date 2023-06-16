import { getSceneLoadPromise } from "@smallbraingames/small-phaser";
import { Coord, createCamera } from "@latticexyz/phaserx";
import { GameConfig } from "../../../util/types";
import createGameTilemap from "../../helpers/createGameTilemap";
import api from "../../../api";
// import { getTopLayerKeyPair } from "../../../util/tile";
// import { EntityIdtoTilesetId } from "../../../util/constants";

const setupMainScene = async (
  scene: Phaser.Scene,
  spawnCoord: Coord,
  config: GameConfig
) => {
  await getSceneLoadPromise(scene);

  const {
    camera: { minZoom, maxZoom, pinchSpeed, scrollSpeed },
    tilemap: { chunkSize, tileHeight, tileWidth },
  } = config;

  /* ------------------------------ Setup Camera ------------------------------ */
  const camera = createCamera(scene.cameras.main, {
    minZoom,
    maxZoom,
    pinchSpeed,
    wheelSpeed: scrollSpeed,
  });

  /* ----------------------------- Create Tilemaps ---------------------------- */
  const tilemap = createGameTilemap(
    scene,
    camera,
    tileWidth,
    tileHeight,
    chunkSize
  );

  const spawnPixelCoord = api.util.gameCoordToPixelCoord(spawnCoord);

  //set default camera position and zoom
  camera.setZoom(minZoom);
  camera.centerOn(spawnPixelCoord.x, spawnPixelCoord.y);
  camera.phaserCamera.fadeIn(1000);

  return {
    spawnCoord,
    scene,
    config,
    tilemap,
    camera,
  };
};

export default setupMainScene;
