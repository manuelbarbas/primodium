import { Core } from "@/lib/types";
import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";

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

  defineComponentSystem(systemWorld, tables.TilePositions, ({ entity, value: [newVal, oldVal] }) => {
    const asteroid = tables.OwnedBy.get(entity)?.value as Entity;
    if (!asteroid) return;

    // remove old reverse position
    if (oldVal?.value) {
      const coords = convertToCoords(oldVal.value);
      coords.forEach((coord) => {
        const positionEntity = getBuildingPositionEntity(coord, asteroid);
        tables.ReverseBuildingPosition.remove(positionEntity);
      });
    }

    // add new reverse position
    if (newVal?.value) {
      const coords = convertToCoords(newVal.value);
      coords.forEach((coord) => {
        const positionEntity = getBuildingPositionEntity(coord, asteroid);
        tables.ReverseBuildingPosition.set({ value: entity }, positionEntity);
      });
    }
  });
};
