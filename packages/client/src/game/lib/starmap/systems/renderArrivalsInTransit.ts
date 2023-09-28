import {
  ComponentUpdate,
  EntityID,
  Has,
  HasValue,
  defineUpdateSystem,
  defineEnterSystem,
  defineExitSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { BlockNumber } from "src/network/components/clientComponents";
import { world } from "src/network/world";
import { ObjectPosition, Tween } from "../../common/object-components/common";
import { Circle, Line } from "../../common/object-components/graphics";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Arrival, Position } from "src/network/components/chainComponents";
import { DepthLayers } from "@game/constants";

export const renderArrivalsInTransit = (scene: Scene, player: EntityID) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");
  const objIndexSuffix = "_arrival";

  const query = [
    Has(Arrival),
    HasValue(Arrival, {
      from: player,
    }),
  ];

  const render = (update: ComponentUpdate) => {
    const entityId = world.entities[update.entity];
    scene.objectPool.removeGroup(entityId + objIndexSuffix);
    const arrival = Arrival.getEntity(entityId);
    const blockInfo = BlockNumber.get();

    if (!arrival || !blockInfo) return;

    //don't render if arrival is already in orbit
    if (Number(arrival.arrivalBlock) < blockInfo.value) return;

    const origin = Position.get(arrival.origin);
    const destination = Position.get(arrival.destination);

    if (!origin || !destination) return;

    const originPixelCoord = tileCoordToPixelCoord(
      { x: origin.x, y: -origin.y },
      tileWidth,
      tileHeight
    );

    const destinationPixelCoord = tileCoordToPixelCoord(
      { x: destination.x, y: -destination.y },
      tileWidth,
      tileHeight
    );

    const sendTrajectory = scene.objectPool.getGroup(entityId + objIndexSuffix);

    sendTrajectory.add("Graphics").setComponents([
      ObjectPosition(originPixelCoord, DepthLayers.Marker),
      Line(destinationPixelCoord, {
        thickness: 2,
        alpha: 0.25,
        color: 0x00ffff,
      }),
      Circle(7, {
        position: destinationPixelCoord,
        alpha: 0.5,
        color: 0xff0000,
      }),
    ]);

    const remainingBlocks = Number(arrival.arrivalBlock) - blockInfo.value;

    //animated transit timeline
    scene.phaserScene.add
      .timeline([
        {
          at: 0,
          run: () => {
            const blocksTraveled = blockInfo.value - Number(arrival.timestamp);
            const totalBlocks =
              Number(arrival.arrivalBlock) - Number(arrival.timestamp);

            const progress = blocksTraveled / totalBlocks;

            // Calculate the starting position based on progress
            const startX =
              originPixelCoord.x +
              (destinationPixelCoord.x - originPixelCoord.x) * progress;
            const startY =
              originPixelCoord.y +
              (destinationPixelCoord.y - originPixelCoord.y) * progress;

            // Set the fleet icon's starting position to the calculated values
            const fleetIcon = scene.phaserScene.add
              .circle(startX, startY, 7, 0x00ffff)
              .setDepth(DepthLayers.Marker);

            // Tween the fleet icon to the destination
            scene.phaserScene.tweens.add({
              targets: fleetIcon,
              x: destinationPixelCoord.x,
              y: destinationPixelCoord.y,
              duration: remainingBlocks * blockInfo.avgBlockTime * 1000,
              onComplete: () => {
                fleetIcon.destroy();
              },
            });
          },
        },
        {
          at: remainingBlocks * blockInfo.avgBlockTime * 1000,
          run: () => {
            scene.objectPool.removeGroup(entityId + objIndexSuffix);

            const arrivalOrbit = scene.objectPool.getGroup(
              entityId + objIndexSuffix
            );

            arrivalOrbit.add("Graphics").setComponents([
              ObjectPosition(destinationPixelCoord, DepthLayers.Marker),
              Circle(50, {
                color: 0x363636,
                borderThickness: 1,
                alpha: 0,
              }),
              Circle(5, {
                color: 0x00ffff,
                borderThickness: 0,
                alpha: 1,
                position: {
                  x: destinationPixelCoord.x + 50,
                  y: destinationPixelCoord.y,
                },
              }),
              Tween(scene, {
                angle: 360,
                duration: 20 * 1000,
                repeat: -1,
                ease: "Linear",
              }),
            ]);
          },
        },
      ])
      .play();
  };

  defineEnterSystem(gameWorld, query, (update) => {
    render(update);
  });

  defineUpdateSystem(gameWorld, query, render);

  defineExitSystem(gameWorld, query, (update) => {
    const entityId = world.entities[update.entity];
    const objIndex = entityId + objIndexSuffix;

    scene.objectPool.removeGroup(objIndex);
  });
};
