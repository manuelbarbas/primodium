import { DepthLayers } from "@game/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { ComponentUpdate, Has, defineEnterSystem, defineExitSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { SetupResult } from "src/network/types";
import { world } from "src/network/world";
import { PIRATE_KEY } from "src/util/constants";
import { hashKeyEntity } from "src/util/encode";
import { getNow } from "src/util/time";
import { ObjectPosition, OnComponentSystem, Tween } from "../../common/object-components/common";
import { Circle, Line } from "../../common/object-components/graphics";

export const renderArrivalsInTransit = (scene: Scene, mud: SetupResult) => {
  const playerEntity = mud.network.playerEntity;
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");
  const objIndexSuffix = "_arrival";

  const render = ({ entity }: ComponentUpdate) => {
    scene.objectPool.removeGroup(entity + objIndexSuffix);
    const arrival = components.Arrival.getEntity(entity);

    if (!arrival) return;

    //don't render if arrival is already in orbit
    if (arrival.arrivalTime < getNow()) return;

    const origin = components.Position.get(arrival.origin);
    const destination = components.Position.get(arrival.destination);

    console.log("destination:", destination);
    if (!origin || !destination) return;

    //render personal pirates only
    if (
      components.PirateAsteroid.has(arrival.destination) &&
      hashKeyEntity(PIRATE_KEY, playerEntity) !== components.OwnedBy.get(arrival.destination)?.value
    )
      return;

    const originPixelCoord = tileCoordToPixelCoord({ x: origin.x, y: -origin.y }, tileWidth, tileHeight);

    const destinationPixelCoord = tileCoordToPixelCoord({ x: destination.x, y: -destination.y }, tileWidth, tileHeight);

    const sendTrajectory = scene.objectPool.getGroup(entity + objIndexSuffix);

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
      OnComponentSystem(components.BlockNumber, (gameObject, _, systemId) => {
        const timeTraveled = getNow() - arrival.sendTime;
        const totaltime = arrival.arrivalTime - arrival.sendTime;

        const progress = Number(timeTraveled) / Number(totaltime);

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

  const query = [
    Has(components.Arrival),
    // Not(components.Pirate)
  ];

  defineEnterSystem(gameWorld, query, (update) => {
    render(update);
  });

  defineExitSystem(gameWorld, query, ({ entity }) => {
    const objIndex = entity + objIndexSuffix;

    scene.objectPool.removeGroup(objIndex);
  });
};
