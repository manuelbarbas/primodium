import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  EntityID,
  EntityIndex,
  Has,
  defineComponentSystem,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  getComponentValue,
} from "@latticexyz/recs";

import { Coord } from "@latticexyz/utils";

import { Scene } from "src/engine/types";
import { Network } from "src/network/layer";
import { offChainComponents, singletonIndex } from "src/network/world";
import { createBuilding } from "../factory/building";

const MAX_SIZE = 2 ** 15 - 1;
export const renderBuildingSprite = (scene: Scene, network: Network) => {
  const {
    world,
    components: { Position, BuildingType, BuildingLevel },
  } = network;
  const { SelectedBuilding } = offChainComponents;
  const { tileHeight, tileWidth } = scene.tilemap;

  const render = ({ entity }: { entity: EntityIndex }) => {
    const entityId = world.entities[entity];
    const renderId = `${entity}_entitySprite`;
    const tilePosition = getComponentValue(Position, entity);

    const buildingType = getComponentValue(BuildingType, entity)?.value;
    const buildingLevel = getComponentValue(BuildingLevel, entity)?.value;

    if (!buildingType || !tilePosition) return;

    const selected =
      getComponentValue(SelectedBuilding, singletonIndex)?.value === entityId;

    // don't render beyond coord map limitation
    if (
      Math.abs(tilePosition.x) > MAX_SIZE ||
      Math.abs(tilePosition.y) > MAX_SIZE
    )
      return;

    const pixelCoord = tileCoordToPixelCoord(
      tilePosition as Coord,
      tileWidth,
      tileHeight
    );

    scene.objectPool.remove(renderId);

    const buildingRenderEntity = scene.objectPool.get(renderId, "Sprite");
    buildingRenderEntity.setComponent(
      createBuilding({
        renderId,
        x: pixelCoord.x,
        y: -pixelCoord.y,
        buildingType: buildingType as EntityID,
        selected,
        level: parseInt(buildingLevel ? buildingLevel.toString() : "1"),
      })
    );
  };

  const positionQuery = [Has(Position), Has(BuildingType)];
  defineEnterSystem(world, positionQuery, render);

  const updateQuery = [Has(Position), Has(BuildingType), Has(BuildingLevel)];
  defineUpdateSystem(world, updateQuery, render);

  defineExitSystem(world, positionQuery, ({ entity }) => {
    const renderId = `${entity}_entitySprite`;
    scene.objectPool.remove(renderId);
  });

  defineComponentSystem(
    world,
    SelectedBuilding,
    ({ value: [newValue, oldValue] }) => {
      if (oldValue?.value) {
        const entityIndex = world.entityToIndex.get(oldValue.value);
        if (entityIndex) render({ entity: entityIndex });
      }
      if (newValue?.value) {
        const entityIndex = world.entityToIndex.get(newValue.value);
        if (entityIndex) render({ entity: entityIndex });
      }
    }
  );
};
