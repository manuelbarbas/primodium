import {
  Entity,
  Has,
  HasValue,
  defineComponentSystem,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  namespaceWorld,
  runQuery,
} from "@latticexyz/recs";

import { Scene } from "engine/types";
import { world } from "src/network/world";

import { EntityType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Building } from "../objects/Building";
import { components } from "src/network/components";
import { getBuildingBottomLeft, getBuildingDimensions } from "src/util/building";

export const renderBuilding = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const spectateWorld = namespaceWorld(world, "game_spectate");

  //TODO: temp till smart containers
  const buildings = new Map<Entity, Building>();
  defineComponentSystem(systemsWorld, components.ActiveRock, ({ value }) => {
    if (!value[0] || value[0]?.value === value[1]?.value) return;

    const activeRock = value[0]?.value as Entity;

    world.dispose("game_spectate");

    const positionQuery = [
      HasValue(components.Position, {
        parent: value[0]?.value,
      }),
      Has(components.BuildingType),
      Has(components.IsActive),
      Has(components.Level),
    ];

    const oldPositionQuery = [
      HasValue(components.Position, {
        parent: value[1]?.value,
      }),
      Has(components.BuildingType),
      Has(components.IsActive),
      Has(components.Level),
    ];

    for (const entity of runQuery(oldPositionQuery)) {
      const building = buildings.get(entity);
      if (building) {
        building.dispose();
        buildings.delete(entity);
      }
    }

    const render = ({ entity }: { entity: Entity }) => {
      if (buildings.has(entity)) return;

      const buildingType = components.BuildingType.get(entity)?.value as Entity | undefined;

      if (!buildingType) return;

      //remove droid base if mainbase exists
      if (buildingType === EntityType.MainBase) {
        const droidBaseEntity = hashEntities(activeRock, EntityType.DroidBase);
        components.Position.remove(droidBaseEntity);
        components.BuildingType.remove(droidBaseEntity);
        components.Level.remove(droidBaseEntity);
        components.IsActive.remove(droidBaseEntity);
        components.OwnedBy.remove(droidBaseEntity);
      }

      const origin = components.Position.get(entity);
      if (!origin) return;
      const tilePosition = getBuildingBottomLeft(origin, buildingType);

      const buildingDimensions = getBuildingDimensions(buildingType);

      const building = new Building(scene, buildingType, buildingDimensions, tilePosition)
        .spawn()
        .setLevel(components.Level.get(entity)?.value ?? 1n);

      buildings.set(entity, building);
    };

    defineEnterSystem(spectateWorld, positionQuery, render);
    defineUpdateSystem(spectateWorld, positionQuery, (update) => {
      render(update);
    });

    defineExitSystem(spectateWorld, positionQuery, ({ entity }) => {
      const renderId = `${entity}_entitySprite`;

      scene.objectPool.removeGroup(renderId);
    });
  });
};
