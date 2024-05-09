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
import { world } from "@/network/world";

import { EntityType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Building } from "../../../lib/objects/Building";
import { components } from "src/network/components";
import { getBuildingBottomLeft } from "src/util/building";
import { removeRaidableAsteroid } from "src/game/scenes/starmap/systems/utils/initializeSecondaryAsteroids";
import { createObjectApi } from "@/game/api/objects";
import { EMap } from "contracts/config/enums";
import { isDomInteraction } from "@/util/canvas";

export const renderBuilding = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const spectateWorld = namespaceWorld(world, "game_spectate");
  const objects = createObjectApi(scene);

  defineComponentSystem(systemsWorld, components.ActiveRock, ({ value }) => {
    if (!value[0] || value[0]?.value === value[1]?.value) return;

    const activeRock = value[0]?.value as Entity;

    world.dispose("game_spectate");

    const positionQuery = [
      HasValue(components.Position, {
        parentEntity: value[0]?.value,
      }),
      Has(components.BuildingType),
      Has(components.IsActive),
      Has(components.Level),
    ];

    const oldPositionQuery = [
      HasValue(components.Position, {
        parentEntity: value[1]?.value,
      }),
      Has(components.BuildingType),
      Has(components.IsActive),
      Has(components.Level),
    ];

    for (const entity of runQuery(oldPositionQuery)) {
      const building = objects.building.get(entity);
      if (building) {
        building.destroy();
      }
    }

    const render = ({ entity }: { entity: Entity }) => {
      if (objects.building.has(entity)) {
        const building = objects.building.get(entity);
        if (!building) return;
        building.setLevel(components.Level.get(entity)?.value ?? 1n);
        building.setActive(components.IsActive.get(entity)?.value ?? true);

        return;
      }

      const buildingType = components.BuildingType.get(entity)?.value as Entity | undefined;

      if (!buildingType) return;

      //remove droid base if mainbase exists
      if (buildingType === EntityType.MainBase) {
        const droidBaseEntity = hashEntities(activeRock, EntityType.DroidBase);
        const droidBaseActive = components.IsActive.get(droidBaseEntity)?.value;
        components.Position.remove(droidBaseEntity);
        components.BuildingType.remove(droidBaseEntity);
        components.Level.remove(droidBaseEntity);
        components.IsActive.remove(droidBaseEntity);
        components.OwnedBy.remove(droidBaseEntity);
        // if droidbaseactive is defined, remove raidable asteroid. if not, it means it was already removed
        if (droidBaseActive && components.Asteroid.get(activeRock)?.mapId === EMap.Common) {
          removeRaidableAsteroid(activeRock);
        }
      }

      if (buildingType === EntityType.WormholeBase) {
        const wormholeEntity = hashEntities(activeRock, EntityType.Wormhole);
        components.Position.remove(wormholeEntity);
        components.BuildingType.remove(wormholeEntity);
        components.Level.remove(wormholeEntity);
        components.IsActive.remove(wormholeEntity);
        components.OwnedBy.remove(wormholeEntity);
      }

      const origin = components.Position.get(entity);
      if (!origin) return;
      const tilePosition = getBuildingBottomLeft(origin, buildingType);

      const building = new Building({ id: entity, scene, buildingType, coord: tilePosition })
        // .spawn()
        .setLevel(components.Level.get(entity)?.value ?? 1n)
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, (pointer: Phaser.Input.Pointer) => {
          if (pointer.getDuration() > 250 || isDomInteraction(pointer, "up")) return;
          components.SelectedBuilding.set({
            value: entity,
          });
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
          components.HoverEntity.set({
            value: entity,
          });

          if (components.SelectedBuilding.get()?.value === entity) return;

          building.setOutline(0x808080, 3);
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
          components.HoverEntity.remove();

          if (components.SelectedBuilding.get()?.value === entity) return;

          building.clearOutline();
        });

      // buildings.set(entity, building);
    };

    //handle selectedBuilding changes
    defineComponentSystem(spectateWorld, components.SelectedBuilding, ({ value }) => {
      if (value[0]?.value === value[1]?.value) return;

      const newBuilding = objects.building.get(value[0]?.value as Entity);
      if (newBuilding) {
        newBuilding.clearOutline();
        newBuilding.setOutline(0x00ffff, 3);
      }

      const oldBuilding = objects.building.get(value[1]?.value as Entity);
      if (oldBuilding) oldBuilding.clearOutline();
    });

    defineEnterSystem(spectateWorld, positionQuery, render);
    defineUpdateSystem(spectateWorld, positionQuery, render);

    defineExitSystem(spectateWorld, positionQuery, ({ entity }) => {
      const building = objects.building.get(entity);
      if (building) {
        building.destroy();
      }
    });
  });
};
