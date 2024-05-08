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
import { SceneApi } from "@/game/api/scene";
import { BuildingConstruction } from "src/game/lib/objects/Building";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { getBuildingDimensions } from "src/util/building";
import { TransactionQueueType } from "src/util/constants";

const getQueuePositionString = (entity: Entity) => {
  const position = components.TransactionQueue.getIndex(entity);

  return position > 0 ? position.toString() : "*";
};
export const renderQueuedBuildings = (scene: SceneApi) => {
  const systemsWorld = namespaceWorld(world, "systems");

  const query = [
    Has(components.TransactionQueue),
    HasValue(components.TransactionQueue, {
      type: TransactionQueueType.Build,
    }),
  ];

  // const buildingConstructions = new Map<Entity, BuildingConstruction>();
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
