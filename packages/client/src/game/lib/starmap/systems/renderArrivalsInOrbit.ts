import { DepthLayers } from "@game/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { PIRATE_KEY } from "src/util/constants";
import { hashKeyEntity } from "src/util/encode";
import { ObjectPosition, SetValue, Tween } from "../../common/object-components/common";
import { Circle } from "../../common/object-components/graphics";

const orbitRadius = 64;
function calculatePosition(angleInDegrees: number, origin: { x: number; y: number }): { x: number; y: number } {
  const radians = (angleInDegrees * Math.PI) / 180; // Convert angle to radians
  const x = orbitRadius * Math.cos(radians); // Calculate x coordinate
  const y = orbitRadius * Math.sin(radians); // Calculate y coordinate

  return { x: x + origin.x, y: y + origin.y };
}

const getAllOrbitingArrivals = (entity: Entity, playerEntity: Entity) => {
  if (
    components.PirateAsteroid.has(entity) &&
    hashKeyEntity(PIRATE_KEY, playerEntity) !== components.OwnedBy.get(entity)?.value
  )
    return [];

  return components.Arrival.get({
    destination: entity,
    onlyOrbiting: true,
  });
};

export const renderEntityOrbitingArrivals = (rockEntity: Entity, playerEntity: Entity, scene: Scene) => {
  const objIndexSuffix = "_spacerockOrbits";
  const { tileWidth, tileHeight } = scene.tilemap;
  const allArrivals = getAllOrbitingArrivals(rockEntity, playerEntity);
  const position = components.Position.get(rockEntity);
  scene.objectPool.removeGroup(rockEntity + objIndexSuffix);
  if (!position || allArrivals.length == 0) return;

  scene.objectPool.removeGroup(rockEntity + objIndexSuffix);

  const destination = components.Position.get(rockEntity);

  if (!destination) return;

  const destinationPixelCoord = tileCoordToPixelCoord({ x: destination.x, y: -destination.y }, tileWidth, tileHeight);

  const arrivalOrbit = scene.objectPool.getGroup(rockEntity + objIndexSuffix);

  arrivalOrbit.add("Graphics").setComponents([
    ObjectPosition(destinationPixelCoord, DepthLayers.Path),
    Circle(orbitRadius, {
      color: 0x363636,
      borderThickness: 1,
      alpha: 0,
    }),
    SetValue({
      input: null,
    }),
  ]);
  allArrivals.forEach((arrival, i) => {
    const angle = ((i + 1) / allArrivals.length) * 360;
    const distance = 360 / allArrivals.length;
    arrivalOrbit.add("Graphics").setComponents([
      ObjectPosition(destinationPixelCoord, DepthLayers.Marker),
      SetValue({
        input: null,
      }),
      Circle(5, {
        color: 0x00ffff,
        borderThickness: 1,
        alpha: 0.75,
        position: calculatePosition(angle, destinationPixelCoord),
      }),
      Tween(scene, {
        angle: distance,
        duration: (20 * 1000) / allArrivals.length,
        repeat: -1,
        ease: "Linear",
      }),
    ]);
  });
};

export const renderArrivalsInOrbit = (scene: Scene) => {
  const gameWorld = namespaceWorld(world, "game");

  defineComponentSystem(gameWorld, components.Arrival, (update) => {
    const playerEntity = components.Account.get()?.value;
    if (!playerEntity) return;
    if (update.value[0]) {
      renderEntityOrbitingArrivals(update.value[0].destination as Entity, playerEntity, scene);
    } else if (update.value[1]) {
      renderEntityOrbitingArrivals(update.value[1].destination as Entity, playerEntity, scene);
    }
  });
};
