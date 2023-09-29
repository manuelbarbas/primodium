import {
  ComponentUpdate,
  Has,
  defineEnterSystem,
  defineExitSystem,
  namespaceWorld,
  defineComponentSystem,
  Not,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { BlockNumber, MapOpen } from "src/network/components/clientComponents";
import { world } from "src/network/world";
import { ObjectPosition, Tween } from "../../common/object-components/common";
import { Circle, Line } from "../../common/object-components/graphics";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  Arrival,
  Pirate,
  Position,
} from "src/network/components/chainComponents";
import { DepthLayers } from "@game/constants";

export const renderArrivalsInTransit = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");
  const objIndexSuffix = "_arrival";

  const query = [Has(Arrival), Not(Pirate)];

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
    const tweenWorld = namespaceWorld(world, entityId + objIndexSuffix);
    const tween = scene.phaserScene.tweens.add({
      targets: fleetIcon,
      x: destinationPixelCoord.x,
      y: destinationPixelCoord.y,
      duration: remainingBlocks * blockInfo.avgBlockTime * 1000,
      onComplete: () => {
        tweenWorld.dispose();
        fleetIcon.destroy();

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
    });

    let pauseTimestamp: number;
    defineComponentSystem(tweenWorld, MapOpen, ({ value }) => {
      if (!tween) return;

      if (value[0]?.value === false && value[1]?.value === true) {
        pauseTimestamp = Date.now();
      } else if (value[0]?.value === true && value[1]?.value === false) {
        tween.seek(
          tween.progress * tween.duration + Date.now() - pauseTimestamp,
          undefined,
          true
        );
      }
    });
  };

  defineEnterSystem(gameWorld, query, (update) => {
    render(update);
  });

  defineExitSystem(gameWorld, query, (update) => {
    const entityId = world.entities[update.entity];
    const objIndex = entityId + objIndexSuffix;

    scene.objectPool.removeGroup(objIndex);
  });
};
