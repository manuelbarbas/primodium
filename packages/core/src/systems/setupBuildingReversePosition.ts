import { SetupResult } from "@/lib/types";
import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";

/**
 * This system sets up the reverse position of a building
 */
export const setupBuildingReversePosition = (setupResult: SetupResult) => {
  const {
    network: { world },
    components,
    utils: { convertToCoords, getBuildingPositionEntity },
  } = setupResult;

  const systemWorld = namespaceWorld(world, "coreSystems");

  defineComponentSystem(systemWorld, components.TilePositions, ({ entity, value: [newVal, oldVal] }) => {
    const asteroid = components.OwnedBy.get(entity)?.value as Entity;
    if (!asteroid) return;

    // remove old reverse position
    if (oldVal?.value) {
      const coords = convertToCoords(oldVal.value);
      coords.forEach((coord) => {
        const positionEntity = getBuildingPositionEntity(coord, asteroid);
        components.ReverseBuildingPosition.remove(positionEntity);
      });
    }

    // add new reverse position
    if (newVal?.value) {
      const coords = convertToCoords(newVal.value);
      coords.forEach((coord) => {
        const positionEntity = getBuildingPositionEntity(coord, asteroid);
        components.ReverseBuildingPosition.set({ value: entity }, positionEntity);
      });
    }
  });
};
