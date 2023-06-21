// PRIMODIUM ENTRY POINT
import engine from "../../engine";
import gameConfig from "../config/gameConfig";
import mainSceneConfig from "../config/mainSceneConfig";
import { Scenes } from "../constants";
import createChunkManager from "./managers/chunkManager";

const init = async () => {
  const game = await engine.createGame(gameConfig);
  const scene = await game.sceneManager.addScene(Scenes.Main, mainSceneConfig);

  const chunkManager = await createChunkManager(scene.tilemap);
  chunkManager.renderInitialChunks();
  chunkManager.startChunkRenderer();

  let lineWidth = 0.5;
  const hoverTile = scene.phaserScene.add.graphics({
    lineStyle: { width: lineWidth, color: 0xffff00 },
    fillStyle: { color: 0xffff00, alpha: 0.3 },
  });

  // Calculate the equivalent screen coordinates

  scene.scriptManager.add((time, delta) => {
    const { worldX, worldY } = scene.phaserScene.input.activePointer;

    hoverTile
      .clear()
      .lineStyle(Math.sin(((time * delta) / 1000) * 1) * 0.5 + 0.7, 0xffff00)
      .strokeRect(0, 0, 16, 16)
      .fillRect(0, 0, 16, 16)
      .setDepth(100)
      .setX(Math.floor(worldX / 16) * 16)
      .setY(Math.floor(worldY / 16) * 16);
  });
};

export default init;
