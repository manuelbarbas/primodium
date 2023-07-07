// PRIMODIUM ENTRY POINT
import { Coord, coordEq, pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { EntityID } from "@latticexyz/recs";
import { engine } from "../../../engine";
import { Network } from "../../../network/layer";
import gameConfig from "../../config/gameConfig";
import mainSceneConfig from "../../config/mainSceneConfig";
import { KeybindActions, Scenes } from "../../constants";
import { createChunkManager } from "./managers/chunkManager";
import * as components from "../../api/components";
import { BlockType } from "src/util/constants";
import {
  buildBuilding,
  demolishBuilding,
  demolishPath,
  buildPath,
} from "src/util/web3";
import { runSystems } from "../systems";
import { inTutorial, validTutorialClick } from "src/util/tutorial";
import { isPressed } from "src/game/api/input";
import { pan } from "src/game/api/camera";

export const init = async (address: string | undefined, network: Network) => {
  const { world } = network;
  const game = await engine.createGame(gameConfig);
  const scene = await game.sceneManager.addScene(Scenes.Main, mainSceneConfig);

  const chunkManager = await createChunkManager(scene.tilemap);
  chunkManager.renderInitialChunks();
  chunkManager.startChunkRenderer();

  scene.camera.phaserCamera.fadeIn(1000);

  scene.input.click$.subscribe((event) => {
    const { x, y } = pixelCoordToTileCoord(
      { x: event.worldX, y: event.worldY },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );

    const gameCoord = { x, y: -y } as Coord;

    //make sure player address is initialized
    if (!address) return;

    //block invalid clicks in tutorial
    if (inTutorial(address, network)) {
      if (!validTutorialClick(gameCoord, network)) return;
    }

    const selectedBuilding = components.selectedBuilding(network).get();
    components.selectedTile(network).set(gameCoord);

    //handle web3 mutations
    switch (selectedBuilding) {
      case undefined:
        break;
      case BlockType.DemolishBuilding:
        components.selectedBuilding(network).remove();
        demolishBuilding(gameCoord, network);
        return;
      case BlockType.DemolishPath:
        components.selectedBuilding(network).remove();
        demolishPath(gameCoord, network);
      case BlockType.Conveyor:
        const startCoord = components.startSelectedPath(network).get();

        if (!startCoord) {
          components.startSelectedPath(network).set(gameCoord);
          return;
        }

        components.selectedBuilding(network).remove();
        buildPath(startCoord, gameCoord, network);
        return;
      case BlockType.SelectAttack:
        const selectedAttackTiles = components.selectedAttack(network).get();

        if (!selectedAttackTiles.origin) {
          components.selectedAttack(network).setOrigin(gameCoord);
          return;
        }

        if (!selectedAttackTiles.target) {
          components.selectedAttack(network).setTarget(gameCoord);
          return;
        }
        //if both origin and target are set, don't do anything
        break;
      default:
        components.selectedBuilding(network).remove();
        buildBuilding(
          gameCoord,
          selectedBuilding as EntityID,
          address,
          network
        );
        return;
    }
  });

  scene.input.pointermove$.pipe().subscribe((event) => {
    const { x, y } = pixelCoordToTileCoord(
      { x: event.pointer.worldX, y: event.pointer.worldY },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );

    const mouseCoord = { x, y: -y } as Coord;

    //set hover tile if it is different
    const currentHoverTile = components.hoverTile(network).get();
    if (coordEq(currentHoverTile, mouseCoord)) return;

    components.hoverTile(network).set(mouseCoord);
  });

  //accumalate sub-pixel movement during a gametick and add to next game tick.
  let accumulatedX = 0;
  let accumulatedY = 0;
  const SPEED = 500;
  const ZOOM_SPEED = 5;
  const handleCameraMovement = (_: number, delta: number) => {
    //don't move camera if there are any active tweens
    if (scene.phaserScene.tweens.getTweensOf(scene.camera.phaserCamera).length)
      return;

    const scrollX = scene.camera.phaserCamera.scrollX;
    const scrollY = scene.camera.phaserCamera.scrollY;
    const zoom = scene.camera.phaserCamera.zoom;
    const maxZoom = scene.config.camera.maxZoom;
    const minZoom = scene.config.camera.minZoom;

    const speed = isPressed(KeybindActions.Modifier) ? SPEED / 2 : SPEED;
    const zoomSpeed = isPressed(KeybindActions.Modifier)
      ? ZOOM_SPEED / 2
      : ZOOM_SPEED;
    const moveDistance = speed * (delta / 1000);
    const zoomAmount = zoomSpeed * (delta / 1000);

    let moveX = 0;
    let moveY = 0;

    if (isPressed(KeybindActions.Up)) moveY--;
    if (isPressed(KeybindActions.Down)) moveY++;
    if (isPressed(KeybindActions.Left)) moveX--;
    if (isPressed(KeybindActions.Right)) moveX++;

    if (moveX !== 0 || moveY !== 0) {
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      accumulatedX += (moveX / length) * moveDistance;
      accumulatedY += (moveY / length) * moveDistance;

      const integralMoveX = Math.floor(accumulatedX);
      const integralMoveY = Math.floor(accumulatedY);

      accumulatedX -= integralMoveX;
      accumulatedY -= integralMoveY;

      scene.camera.setScroll(scrollX + integralMoveX, scrollY + integralMoveY);
    }

    if (isPressed(KeybindActions.Center)) {
      pan({ x: 0, y: 0 });
    }

    if (isPressed(KeybindActions.ZoomIn)) {
      const targetZoom = Math.min(zoom + zoomAmount, maxZoom);
      scene.camera.setZoom(targetZoom);
    }

    if (isPressed(KeybindActions.ZoomOut)) {
      const targetZoom = Math.max(zoom - zoomAmount, minZoom);
      console.log(targetZoom, zoom, zoomAmount);
      scene.camera.setZoom(targetZoom);
    }
  };

  scene.scriptManager.add(handleCameraMovement);

  runSystems(scene, network);

  world.registerDisposer(() => {
    chunkManager.dispose();
    game.dispose();
  });
};
