// PRIMODIUM ENTRY POINT
import engine from "../../engine";
import gameConfig from "../config/gameConfig";
import mainSceneConfig from "../config/mainSceneConfig";
import { Scenes } from "../constants";
import { PulsingColoredTile } from "../objects/ PulsingColoredTile";
import { TestSprite } from "../objects/TestSprite";
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

  scene.camera.phaserCamera.fadeIn(1000);

  const obj = new TestSprite(
    scene.phaserScene,
    32,
    32,
    "sprite-atlas",
    "mainbase/mainbase-0.png"
  ).play("mainbase");

  // scene.objectPool.groups.Rectangle.add(
  //   true
  // );

  scene.objectPool.groups.Sprite.add(obj, true);

  const graphics = scene.phaserScene.add.graphics().setDepth(100);

  function drawManhattanLine(
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) {
    graphics.clear();
    // Set the line style
    graphics.lineStyle(1, 0xffffff, 0.5);

    // Calculate the midpoints
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    // Move to the starting point
    graphics.moveTo(startX, startY);

    // Draw the line segments, including midpoints
    graphics.lineTo(midX, startY);
    graphics.lineTo(midX, midY);
    graphics.lineTo(endX, midY);
    graphics.lineTo(endX, endY);

    // Render the line
    graphics.stroke();
  }
  // .sprite(8, 8, "sprite-atlas", "mainbase/mainbase-0.png")

  // Calculate the equivalent screen coordinates

  scene.scriptManager.add(async (time, delta) => {
    const { worldX, worldY } = scene.phaserScene.input.activePointer;

    hoverTile
      .clear()
      .lineStyle(Math.sin(((time * delta) / 1000) * 1) * 0.5 + 0.7, 0xffff00)
      .strokeRect(0, 0, 16, 16)
      .fillRect(0, 0, 16, 16)
      .setDepth(100)
      .setX(Math.floor(worldX / 16) * 16)
      .setY(Math.floor(worldY / 16) * 16);

    drawManhattanLine(
      8,
      8,
      Math.floor(worldX / 16) * 16 + 8,
      Math.floor(worldY / 16) * 16 + 8
    );
  });
};

export default init;
