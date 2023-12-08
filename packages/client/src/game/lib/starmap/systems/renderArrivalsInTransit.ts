import { DepthLayers } from "@game/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { ComponentUpdate, Has, defineEnterSystem, defineExitSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { SetupResult } from "src/network/types";
import { world } from "src/network/world";
import { PIRATE_KEY } from "src/util/constants";
import { hashKeyEntity } from "src/util/encode";
import { ObjectPosition, OnComponentSystem, OnRxjsSystem } from "../../common/object-components/common";
import { Circle, Line } from "../../common/object-components/graphics";
import { renderEntityOrbitingArrivals } from "./renderArrivalsInOrbit";
import { Observable } from "rxjs";

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
    const now = components.Time.get()?.value ?? 0n;
    if (arrival.arrivalTime < now) return;

    const origin = components.Position.get(arrival.origin);
    const destination = components.Position.get(arrival.destination);

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
        id: `${entity}-trajectoryline`,
        thickness: 2,
        alpha: 0.25,
        color: 0x00ffff,
      }),
      Circle(7, {
        position: destinationPixelCoord,
        alpha: 0.5,
        color: 0xff0000,
      }),
      //@ts-ignore
      OnRxjsSystem(scene.camera.zoom$, (_, zoom) => {
        let thickness = 3 / zoom;
        thickness = Math.min(10, thickness);
        console.log("thickness:", thickness);

        trajectory.removeComponent(`${entity}-trajectoryline`);
        trajectory.setComponent(
          Line(destinationPixelCoord, {
            id: `${entity}-trajectoryline`,
            thickness,
            alpha: 0.25,
            color: 0x00ffff,
          })
        );
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
        const now = components.Time.get()?.value ?? 0n;
        const timeTraveled = now - arrival.sendTime;
        const totaltime = arrival.arrivalTime - arrival.sendTime;

        const progress = Number(timeTraveled) / Number(totaltime);

        if (progress > 1) {
          //remove trajectory
          scene.objectPool.remove(trajectory.id);

          //remove moving circle
          fleetIcon.removeComponent("fleet");

          //change to orbit render
          renderEntityOrbitingArrivals(arrival.destination, playerEntity, scene);

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
