// import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { ComponentUpdate, Has } from "@latticexyz/recs";
import { defineEnterSystem, defineExitSystem, defineUpdateSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { Send } from "src/network/components/clientComponents";
import { world } from "src/network/world";
import { ObjectPosition } from "../../common/object-components/common";
import { Circle, Line } from "../../common/object-components/graphics";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { DepthLayers } from "@game/constants";

export const renderUnitSend = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");
  const objIndexSuffix = "_sendingUnit";

  const query = [Has(Send)];

  const render = (update: ComponentUpdate) => {
    const entityId = world.entities[update.entity];
    const origin = Send.getOriginCoord();
    const destination = Send.getDestinationCoord();
    scene.objectPool.removeGroup(entityId + objIndexSuffix);

    if (!origin || !destination) return;

    const originPixelCoord = tileCoordToPixelCoord({ x: origin.x, y: -origin.y }, tileWidth, tileHeight);

    const destinationPixelCoord = tileCoordToPixelCoord({ x: destination.x, y: -destination.y }, tileWidth, tileHeight);

    const sendTrajectory = scene.objectPool.getGroup(entityId + objIndexSuffix);

    sendTrajectory.add("Graphics").setComponents([
      ObjectPosition(originPixelCoord, DepthLayers.Path),
      Line(destinationPixelCoord, {
        thickness: 2,
        alpha: 0.5,
        color: 0x00ffff,
      }),
      Circle(7, {
        alpha: 0.5,
        color: 0x00ffff,
      }),
      Circle(7, {
        position: destinationPixelCoord,
        alpha: 0.5,
        color: 0xffa500,
      }),
    ]);
  };

  defineEnterSystem(gameWorld, query, (update) => {
    render(update);

    console.info("[ENTER SYSTEM](renderSendUnitsTool) Send units tool has been added");
  });

  defineUpdateSystem(gameWorld, query, render);

  defineExitSystem(gameWorld, query, (update) => {
    const entityId = world.entities[update.entity];
    const objIndex = entityId + objIndexSuffix;

    scene.objectPool.removeGroup(objIndex);

    console.info("[EXIT SYSTEM](renderSendUnitsTool) Send units tool has been removed");
  });
};
