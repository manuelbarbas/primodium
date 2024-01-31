import { DepthLayers } from "@game/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Entity, Has, HasValue, defineComponentSystem, namespaceWorld, runQuery } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { getRockRelationship } from "src/util/asteroid";
import { PIRATE_KEY, RockRelationship } from "src/util/constants";
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

const getAllOrbitingFleets = (entity: Entity, playerEntity: Entity) => {
  if (
    components.PirateAsteroid.has(entity) &&
    hashKeyEntity(PIRATE_KEY, playerEntity) !== components.OwnedBy.get(entity)?.value
  )
    return [];

  return [...runQuery([Has(components.IsFleet), HasValue(components.FleetMovement, { destination: entity })])].filter(
    (entity) => {
      const arrivalTime = components.FleetMovement.get(entity)?.arrivalTime ?? 0n;
      const now = components.Time.get()?.value ?? 0n;
      return arrivalTime < now;
    }
  );
};

export const renderEntityOrbitingFleets = (rockEntity: Entity, playerEntity: Entity, scene: Scene) => {
  const objIndexSuffix = "_spacerockOrbits";
  const { tileWidth, tileHeight } = scene.tilemap;
  const allFleets = getAllOrbitingFleets(rockEntity, playerEntity);
  const position = components.Position.get(rockEntity);
  scene.objectPool.removeGroup(rockEntity + objIndexSuffix);
  if (!position || allFleets.length == 0) return;

  const destination = components.Position.get(rockEntity);

  if (!destination) return;

  const destinationPixelCoord = tileCoordToPixelCoord({ x: destination.x, y: -destination.y }, tileWidth, tileHeight);

  const fleetOrbit = scene.objectPool.getGroup(rockEntity + objIndexSuffix);

  fleetOrbit.add("Graphics").setComponents([
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
  allFleets.forEach((fleet, i) => {
    const angle = ((i + 1) / allFleets.length) * 360;
    const distance = 360 / allFleets.length;
    const owner = components.OwnedBy.get(fleet)?.value;
    const relationship = owner ? getRockRelationship(playerEntity, owner as Entity) : RockRelationship.Neutral;
    const color =
      relationship === RockRelationship.Ally ? 0x00ff00 : relationship === RockRelationship.Enemy ? 0xff0000 : 0x00ffff;
    fleetOrbit.add("Graphics").setComponents([
      ObjectPosition(destinationPixelCoord, DepthLayers.Marker),
      SetValue({
        input: null,
      }),
      Circle(5, {
        color,
        borderThickness: 1,
        alpha: 0.75,
        position: calculatePosition(angle, destinationPixelCoord),
      }),
      Tween(scene, {
        angle: distance,
        duration: (20 * 1000) / allFleets.length,
        repeat: -1,
        ease: "Linear",
      }),
    ]);
  });
};

export const renderFleetsInOrbit = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  defineComponentSystem(systemsWorld, components.FleetMovement, (update) => {
    const playerEntity = components.Account.get()?.value;
    if (!playerEntity) return;
    if (update.value[0]) {
      renderEntityOrbitingFleets(update.value[0].destination as Entity, playerEntity, scene);
    }
    if (update.value[1]) {
      renderEntityOrbitingFleets(update.value[1].destination as Entity, playerEntity, scene);
    }
  });
};
