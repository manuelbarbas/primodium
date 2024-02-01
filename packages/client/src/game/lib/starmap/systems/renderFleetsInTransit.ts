import { DepthLayers } from "@game/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  ComponentUpdate,
  Entity,
  Has,
  defineComponentSystem,
  defineExitSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { PIRATE_KEY } from "src/util/constants";
import { hashKeyEntity } from "src/util/encode";
import { getAngleBetweenPoints } from "src/util/vector";
import {
  ObjectPosition,
  OnComponentSystem,
  OnHover,
  OnOnce,
  OnRxjsSystem,
} from "../../common/object-components/common";
import { Circle, Line, Triangle } from "../../common/object-components/graphics";
import { renderEntityOrbitingFleets } from "./renderFleetsInOrbit";

export const renderFleetsInTransit = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const systemsWorld = namespaceWorld(world, "systems");
  const objIndexSuffix = "_fleet";

  const render = ({ entity }: ComponentUpdate) => {
    const playerEntity = components.Account.get()?.value;
    const movement = components.FleetMovement.get(entity);

    if (!movement) return;

    const origin = movement.origin as Entity;
    const destination = movement.destination as Entity;
    scene.objectPool.removeGroup(entity + objIndexSuffix);

    //don't render if fleet is already in orbit
    const now = components.Time.get()?.value ?? 0n;
    if (movement.arrivalTime < now) return;

    const originPosition = components.Position.get(origin);
    const destinationPosition = components.Position.get(destination);

    if (!originPosition || !destinationPosition) return;

    //render personal pirates only
    if (
      components.PirateAsteroid.has(destination) &&
      playerEntity &&
      hashKeyEntity(PIRATE_KEY, playerEntity) !== components.OwnedBy.get(destination)?.value
    )
      return;

    const originPixelCoord = tileCoordToPixelCoord(
      { x: originPosition.x, y: -originPosition.y },
      tileWidth,
      tileHeight
    );

    const destinationPixelCoord = tileCoordToPixelCoord(
      { x: destinationPosition.x, y: -destinationPosition.y },
      tileWidth,
      tileHeight
    );

    const sendTrajectory = scene.objectPool.getGroup(entity + objIndexSuffix);

    const trajectory = sendTrajectory.add("Graphics", true);
    trajectory.setComponents([
      ObjectPosition(originPixelCoord, DepthLayers.Marker),
      Line(destinationPixelCoord, {
        id: `${entity}-trajectoryline`,
        thickness: Math.min(10, 3 / scene.camera.phaserCamera.zoom),
        alpha: 0.25,
        color: 0x00ffff,
      }),
      Circle(7, {
        position: destinationPixelCoord,
        alpha: 0.5,
        color: 0xff0000,
      }),
      OnHover(
        () => {
          components.HoverEntity.set({ value: entity });
        },
        () => {
          components.HoverEntity.remove();
        }
      ),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      OnRxjsSystem(scene.camera.zoom$, (_, zoom) => {
        let thickness = 3 / zoom;
        thickness = Math.min(10, thickness);

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

    const fleetIcon = sendTrajectory.add("Graphics", true);
    const direction = getAngleBetweenPoints(originPosition, destinationPosition);
    fleetIcon.setComponents([
      ObjectPosition(originPixelCoord, DepthLayers.Marker),
      Triangle(15, 20, {
        color: 0x00ffff,
        id: "fleet",
        borderThickness: 1,
        alpha: 0.75,
        direction: direction - 90,
      }),
      OnHover(
        () => {
          components.HoverEntity.set({ value: entity });
        },
        () => {
          components.HoverEntity.remove();
        }
      ),
      OnOnce((gameObject) => {
        gameObject.setInteractive(new Phaser.Geom.Rectangle(-32, -32, 64, 64), Phaser.Geom.Rectangle.Contains);
      }),
      OnComponentSystem(components.Time, (gameObject, update) => {
        const now = update.value[0]?.value ?? 0n;
        const timeTraveled = now - movement.sendTime;
        const totaltime = movement.arrivalTime - movement.sendTime;

        const progress = Number(timeTraveled) / Number(totaltime);

        if (playerEntity && progress > 1) {
          //render orbit
          renderEntityOrbitingFleets(destination, playerEntity, scene);

          //remove transit render
          scene.objectPool.removeGroup(entity + objIndexSuffix);

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
    Has(components.FleetMovement),
    // Not(components.Pirate)
  ];

  defineComponentSystem(systemsWorld, components.FleetMovement, (update) => {
    if (!update.value[0]) {
      const objIndex = update.entity + objIndexSuffix;

      scene.objectPool.removeGroup(objIndex);
      return;
    }
    render(update);
  });

  defineExitSystem(systemsWorld, query, ({ entity }) => {
    const objIndex = entity + objIndexSuffix;

    scene.objectPool.removeGroup(objIndex);
  });
};
