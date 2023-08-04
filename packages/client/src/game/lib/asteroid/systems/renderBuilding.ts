import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  EntityID,
  EntityIndex,
  Has,
  defineComponentSystem,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  namespaceWorld,
} from "@latticexyz/recs";

import { Coord } from "@latticexyz/utils";

import { Scene } from "engine/types";
import { createBuilding } from "../../common/factory/building";
import { world } from "src/network/world";
import {
  Position,
  SelectedBuilding,
} from "src/network/components/clientComponents";
import { Level, BuildingType } from "src/network/components/chainComponents";

const MAX_SIZE = 2 ** 15 - 1;
export const renderBuilding = (scene: Scene) => {
  const { tileHeight, tileWidth } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const render = ({ entity }: { entity: EntityIndex }) => {
    const entityId = world.entities[entity];
    const renderId = `${entity}_entitySprite`;
    const tilePosition = Position.get(entityId);
    const buildingType = BuildingType.get(entityId)?.value;
    const level = Level.get(entityId)?.value;

    if (!buildingType || !tilePosition) return;

    const selected = SelectedBuilding.get()?.value === entityId;

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
        level: parseInt(level ? level.toString() : "1"),
      })
    );
  };

  const positionQuery = [Has(Position), Has(BuildingType)];
  defineEnterSystem(gameWorld, positionQuery, render);

  const updateQuery = [Has(Position), Has(BuildingType), Has(Level)];
  defineUpdateSystem(gameWorld, updateQuery, render);

  defineExitSystem(gameWorld, positionQuery, ({ entity }) => {
    const renderId = `${entity}_entitySprite`;
    scene.objectPool.remove(renderId);
  });

  defineComponentSystem(
    gameWorld,
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
