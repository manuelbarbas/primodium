import { Core } from "@primodiumxyz/core";
import { Coord } from "@primodiumxyz/engine/types";
import { namespaceWorld, $query, Entity } from "@primodiumxyz/reactive-tables";

import { PrimodiumScene } from "@/api/scene";
import { BuildingConstruction } from "@/lib/objects/building";

const getQueuePositionString = (entity: Entity, core: Core) => {
  const { tables } = core;
  const position = tables.TransactionQueue.getIndex(entity);

  return position > 0 ? position.toString() : "*";
};

export const renderQueuedBuildings = (scene: PrimodiumScene, core: Core) => {
  const {
    network: { world },
    tables,
    utils,
  } = core;
  const systemsWorld = namespaceWorld(world, "systems");

  const render = (entity: Entity) => {
    const metadata = tables.TransactionQueue.getMetadata(entity) as { coord: Coord; buildingType: Entity };

    if (!metadata) return;

    const dimensions = utils.getBuildingDimensions(metadata.buildingType);

    if (scene.objects.constructionBuilding.has(entity)) return;

    new BuildingConstruction({
      id: entity,
      scene,
      coord: metadata.coord,
      buildingDimensions: dimensions,
      queueText: getQueuePositionString(entity, core),
    });
  };

  const query = {
    withProperties: [{ table: tables.TransactionQueue, properties: { type: "build" } }],
  };

  $query(systemsWorld, query, {
    onEnter: ({ entity }) => {
      render(entity);
      console.info("[ENTER SYSTEM](transaction queued)");
    },
    onExit: ({ entity }) => {
      scene.objects.constructionBuilding.get(entity)?.destroy();

      //udpate text for remaining queued items
      for (const entity of tables.TransactionQueue.getAll()) {
        scene.objects.constructionBuilding.get(entity)?.setQueueText(getQueuePositionString(entity, core));
      }
      console.info("[EXIT SYSTEM](transaction completed)");
    },
  });
};
