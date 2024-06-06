import {
  ComponentUpdate,
  Entity,
  Has,
  HasValue,
  defineEnterSystem,
  defineExitSystem,
  namespaceWorld,
  runQuery,
} from "@latticexyz/recs";
import { getBuildingDimensions } from "@primodiumxyz/core/util/building";
import { TransactionQueueType } from "@primodiumxyz/core/util/constants";
import { components } from "@primodiumxyz/core/network/components";
import { world } from "@primodiumxyz/core/network/world";

import { PrimodiumScene } from "@/api/scene";
import { BuildingConstruction } from "@/lib/objects/building";

const getQueuePositionString = (entity: Entity) => {
  const position = components.TransactionQueue.getIndex(entity);

  return position > 0 ? position.toString() : "*";
};

export const renderQueuedBuildings = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  const query = [
    Has(components.TransactionQueue),
    HasValue(components.TransactionQueue, {
      type: TransactionQueueType.Build,
    }),
  ];

  const render = ({ entity }: ComponentUpdate) => {
    const metadata = components.TransactionQueue.getMetadata<TransactionQueueType.Build>(entity);

    if (!metadata) return;

    const dimensions = getBuildingDimensions(metadata.buildingType);

    if (scene.objects.constructionBuilding.has(entity)) return;

    new BuildingConstruction({
      id: entity,
      scene,
      coord: metadata.coord,
      buildingDimensions: dimensions,
      queueText: getQueuePositionString(entity),
    });
  };

  defineEnterSystem(systemsWorld, query, (update) => {
    render(update);

    console.info("[ENTER SYSTEM](transaction queued)");
  });

  defineExitSystem(systemsWorld, [Has(components.TransactionQueue)], ({ entity }) => {
    const construction = scene.objects.constructionBuilding.get(entity);
    if (construction) {
      construction.destroy();
    }

    //udpate text for remaining queued items
    for (const entity of runQuery([Has(components.TransactionQueue)])) {
      scene.objects.constructionBuilding.get(entity)?.setQueueText(getQueuePositionString(entity));
    }
    console.info("[EXIT SYSTEM](transaction completed)");
  });
};
