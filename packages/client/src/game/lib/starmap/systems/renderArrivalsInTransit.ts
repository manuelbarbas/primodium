import {
  ComponentUpdate,
  Has,
  defineEnterSystem,
  defineExitSystem,
  namespaceWorld,
  Not,
  EntityID,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { BlockNumber } from "src/network/components/clientComponents";
import { world } from "src/network/world";
import { ObjectPosition, OnComponentSystem, Tween } from "../../common/object-components/common";
import { Circle, Line } from "../../common/object-components/graphics";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Arrival, OwnedBy, Pirate, Position } from "src/network/components/chainComponents";
import { DepthLayers } from "@game/constants";
import { hashStringEntity } from "src/util/encode";
import { PIRATE_KEY } from "src/util/constants";

export const renderArrivalsInTransit = (scene: Scene, player: EntityID) => {
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

    //render personal pirates only
    if (
      Pirate.has(arrival.destination) &&
      hashStringEntity(PIRATE_KEY, player) !== OwnedBy.get(arrival.destination)?.value
    )
      return;

    const originPixelCoord = tileCoordToPixelCoord({ x: origin.x, y: -origin.y }, tileWidth, tileHeight);

    const destinationPixelCoord = tileCoordToPixelCoord({ x: destination.x, y: -destination.y }, tileWidth, tileHeight);

    const sendTrajectory = scene.objectPool.getGroup(entityId + objIndexSuffix);

    const trajectory = sendTrajectory.add("Graphics");
    trajectory.setComponents([
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

    const fleetIcon = sendTrajectory.add("Graphics");
    fleetIcon.setComponents([
      ObjectPosition(originPixelCoord, DepthLayers.Marker),
      Circle(7, {
        color: 0x00ffff,
        id: "fleet",
        borderThickness: 1,
        alpha: 0.75,
      }),
      OnComponentSystem(BlockNumber, (gameObject, { value }, systemId) => {
        const blockNumber = (value[0]?.value as number) ?? 0;
        // const remainingBlocks = Number(arrival.arrivalBlock) - blockNumber;
        const blocksTraveled = blockNumber - Number(arrival.timestamp);
        const totalBlocks = Number(arrival.arrivalBlock) - Number(arrival.timestamp);

        const progress = blocksTraveled / totalBlocks;

        if (progress >= 1) {
          //remove trajectory
          scene.objectPool.remove(trajectory.id);

          //remove moving circle
          fleetIcon.removeComponent("fleet");

          //change to orbit render
          fleetIcon.setComponents([
            ObjectPosition(destinationPixelCoord, DepthLayers.Marker),
            Circle(50, {
              color: 0x363636,
              borderThickness: 1,
              alpha: 0,
            }),
            Circle(5, {
              color: 0x00ffff,
              borderThickness: 1,
              alpha: 0.75,
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

          //remove system
          fleetIcon.removeComponent(systemId);

          return;
        }

        // Calculate the starting position based on progress
        const startX = originPixelCoord.x + (destinationPixelCoord.x - originPixelCoord.x) * progress;
        const startY = originPixelCoord.y + (destinationPixelCoord.y - originPixelCoord.y) * progress;

        gameObject.x = startX;
        gameObject.y = startY;
        fleetIcon.position = { x: startX, y: startY };
      }),
    ]);
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
