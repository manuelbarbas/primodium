import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  ComponentUpdate,
  EntityID,
  Has,
  defineEnterSystem,
  defineExitSystem,
  getComponentValue,
} from "@latticexyz/recs";

import { Coord } from "@latticexyz/utils";

import { Scene } from "src/engine/types";
import { Network } from "src/network/layer";
import { createBuilding } from "../factory/building";

export const renderBuildingSprite = (scene: Scene, network: Network) => {
  const {
    world,
    components: { Position, BuildingType },
  } = network;
  const { tileHeight, tileWidth } = scene.tilemap;

  const query = [Has(Position), Has(BuildingType)];

  const render = (update: ComponentUpdate) => {
    const entityIndex = update.entity;

    const renderId = `${entityIndex}_entitySprite`;
    const tilePosition = getComponentValue(Position, entityIndex);

    const buildingType = getComponentValue(BuildingType, entityIndex)?.value;

    if (!buildingType) return;
    const pixelCoord = tileCoordToPixelCoord(
      tilePosition as Coord,
      tileWidth,
      tileHeight
    );

    if (!scene.objectPool.objects.has(renderId)) {
      const buildingRenderEntity = scene.objectPool.get(renderId, "Sprite");

      const buildingComponent = createBuilding({
        renderId,
        x: pixelCoord.x,
        y: -pixelCoord.y,
        buildingType: buildingType as EntityID,
      });

      buildingRenderEntity.setComponent(buildingComponent);
    }
  };

  defineEnterSystem(world, query, render);

  // not needed for now
  // defineUpdateSystem(world, query, render);

  defineExitSystem(world, query, ({ entity }) => {
    const renderId = `${entity}_entitySprite`;
    scene.objectPool.remove(renderId);
  });
};
