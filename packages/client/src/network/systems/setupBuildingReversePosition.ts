import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { convertToCoords } from "src/util/building";
import { getBuildingPositionEntity } from "src/util/tile";
import { components } from "../components";
import { world } from "../world";

/**
 * This system sets up the reverse position of a building
 */
export const setupBuildingReversePosition = () => {
  const systemWorld = namespaceWorld(world, "systems");

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
