import { Core } from "@/lib/types";
import { Entity, namespaceWorld } from "@primodiumxyz/reactive-tables";

/**
 * This system sets up the reverse position of a building
 */
export const setupBuildingReversePosition = (core: Core) => {
  const {
    network: { world },
    tables,
    utils: { convertToCoords, getBuildingPositionEntity },
  } = core;

  const systemWorld = namespaceWorld(world, "coreSystems");

  tables.TilePositions.watch({
    world: systemWorld,
    onUpdate: ({ entity, properties: { current, prev } }) => {
      const asteroid = tables.OwnedBy.get(entity)?.value as Entity;
      if (!asteroid) return;

      // remove old reverse position
      if (prev?.value) {
        const coords = convertToCoords(prev.value);
        coords.forEach((coord) => {
          const positionEntity = getBuildingPositionEntity(coord, asteroid);
          tables.ReverseBuildingPosition.remove(positionEntity);
        });
      }

      // add new reverse position
      if (current?.value) {
        const coords = convertToCoords(current.value);
        coords.forEach((coord) => {
          const positionEntity = getBuildingPositionEntity(coord, asteroid);
          tables.ReverseBuildingPosition.set({ value: entity }, positionEntity);
        });
      }
    },
  });
};
