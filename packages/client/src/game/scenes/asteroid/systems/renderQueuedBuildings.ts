import {
  ComponentUpdate,
  Entity,
  Has,
  HasValue,
  defineEnterSystem,
  defineExitSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { BuildingConstruction } from "src/game/lib/objects/Building";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { getBuildingDimensions } from "src/util/building";
import { TransactionQueueType } from "src/util/constants";

const getQueuePositionString = (entity: Entity) => {
  const position = components.TransactionQueue.getIndex(entity);

  return position > 0 ? position.toString() : "*";
};
export const renderQueuedBuildings = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  const query = [
    Has(components.TransactionQueue),
    HasValue(components.TransactionQueue, {
      type: TransactionQueueType.Build,
    }),
  ];

  const buildingConstructions = new Map<Entity, BuildingConstruction>();
  const render = ({ entity }: ComponentUpdate) => {
    const metadata = components.TransactionQueue.getMetadata<TransactionQueueType.Build>(entity);

    if (!metadata) return;

    const dimensions = getBuildingDimensions(metadata.buildingType);

    if (buildingConstructions.has(entity)) return;

    const buildingConstruction = new BuildingConstruction(
      scene,
      metadata.coord,
      dimensions,
      getQueuePositionString(entity)
    ).spawn();
    buildingConstructions.set(entity, buildingConstruction);
  };

  defineEnterSystem(systemsWorld, query, (update) => {
    render(update);

    console.info("[ENTER SYSTEM](transaction queued)");
  });

  defineExitSystem(systemsWorld, [Has(components.TransactionQueue)], ({ entity }) => {
    const construction = buildingConstructions.get(entity);
    if (construction) {
      construction.dispose();
      buildingConstructions.delete(entity);
    }

    //udpate text for remaining queued items
    for (const [entity, buildingConstruction] of buildingConstructions) {
      buildingConstruction.setQueueText(getQueuePositionString(entity));
    }
    console.info("[EXIT SYSTEM](transaction completed)");
  });
};
