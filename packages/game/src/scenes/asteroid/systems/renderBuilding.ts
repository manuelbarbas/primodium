import { Entity, namespaceWorld, query, $query } from "@primodiumxyz/reactive-tables";
import { Action, Core, EntityType, hashEntities } from "@primodiumxyz/core";
import { EMap } from "contracts/config/enums";

import { Building } from "@/lib/objects/building";
import { removeRaidableAsteroid } from "@/scenes/starmap/systems/utils/initializeSecondaryAsteroids";
import { DepthLayers } from "@/lib/constants/common";
import { PrimodiumScene } from "@/types";
import { WormholeBase } from "@/lib/objects/building/Wormhole";

export const renderBuilding = (scene: PrimodiumScene, core: Core) => {
  const {
    network: { world },
    tables,
    utils,
  } = core;
  const systemsWorld = namespaceWorld(world, "systems");
  const spectateWorld = namespaceWorld(world, "game_spectate");
  const { objects } = scene;

  tables.ActiveRock.watch({
    world: systemsWorld,
    onUpdate: ({ properties: { current, prev } }) => {
      if (current?.value === prev?.value) return;

      const activeRock = current?.value;

      world.dispose("game_spectate");

      // Find buildings that have this asteroid as parent
      const positionQuery = {
        withProperties: [{ table: tables.Position, properties: { parentEntity: activeRock } }],
        with: [tables.BuildingType, tables.IsActive, tables.Level],
      };

      // Find old buildings that have the previous active asteroid as parent
      const oldPositionQuery = {
        withProperties: [{ table: tables.Position, properties: { parentEntity: prev?.value } }],
        with: [tables.BuildingType, tables.IsActive, tables.Level],
      };

      for (const entity of query(oldPositionQuery)) {
        const building = objects.building.get(entity);
        if (building) {
          building.destroy();
        }
      }

      let initialBuildingsPlaced = false;

      const timeout = setTimeout(() => {
        initialBuildingsPlaced = true;
      }, 1000);

      world.registerDisposer(() => {
        clearTimeout(timeout);
      }, "game_spectate");

      if (!activeRock) return;

      const render = ({ entity, showLevelAnimation = false }: { entity: Entity; showLevelAnimation?: boolean }) => {
        if (objects.building.has(entity)) {
          const building = objects.building.get(entity);
          if (!building) return;
          building.setLevel(tables.Level.get(entity)?.value ?? 1n, !initialBuildingsPlaced || !showLevelAnimation);
          building.setActive(tables.IsActive.get(entity)?.value ?? true);

          // at this point, we might be moving a building, so update its position
          const origin = tables.Position.get(entity);
          const buildingPrototype = tables.BuildingType.get(entity)?.value as Entity | undefined;
          if (!origin || !buildingPrototype) return;
          const tileCoord = utils.getBuildingBottomLeft(origin, buildingPrototype);
          building.setCoordPosition(tileCoord);
          building.setDepth(DepthLayers.Building - tileCoord.y * 5);
          // trigger anim since the building was just moved
          if (initialBuildingsPlaced && !showLevelAnimation) building.triggerPlacementAnim();

          return;
        }

        const buildingType = tables.BuildingType.get(entity)?.value as Entity | undefined;

        if (!buildingType) return;

        //remove droid base if mainbase exists
        if (buildingType === EntityType.MainBase) {
          const droidBaseEntity = hashEntities(activeRock, EntityType.DroidBase);
          const droidBaseActive = tables.IsActive.get(droidBaseEntity)?.value;
          tables.Position.remove(droidBaseEntity);
          tables.BuildingType.remove(droidBaseEntity);
          tables.Level.remove(droidBaseEntity);
          tables.IsActive.remove(droidBaseEntity);
          tables.OwnedBy.remove(droidBaseEntity);
          // if droidbaseactive is defined, remove raidable asteroid. if not, it means it was already removed
          if (droidBaseActive && tables.Asteroid.get(activeRock)?.mapId === EMap.Common) {
            removeRaidableAsteroid(activeRock, tables);
          }
        }

        if (buildingType === EntityType.WormholeBase) {
          const wormholeEntity = hashEntities(activeRock, EntityType.Wormhole);
          tables.Position.remove(wormholeEntity);
          tables.BuildingType.remove(wormholeEntity);
          tables.Level.remove(wormholeEntity);
          tables.IsActive.remove(wormholeEntity);
          tables.OwnedBy.remove(wormholeEntity);
        }

        const origin = tables.Position.get(entity);
        if (!origin) return;
        const tilePosition = utils.getBuildingBottomLeft(origin, buildingType);

        const cooldownTime = tables.CooldownEnd.get(entity)?.value ?? 0n;
        const time = tables.Time.get()?.value ?? 0n;
        const dimensions = utils.getBuildingDimensions(buildingType);
        const building =
          buildingType === EntityType.WormholeBase
            ? new WormholeBase({
                initialState: cooldownTime === 0n || cooldownTime > time ? "idle" : "cooldown",
                id: entity,
                scene,
                coord: tilePosition,
                resource: tables.WormholeResource.get()?.resource ?? EntityType.Iron,
                dimensions,
              })
            : new Building({ id: entity, scene, buildingType, coord: tilePosition, dimensions });

        building
          .setLevel(tables.Level.get(entity)?.value ?? 1n, true)
          .onClick(() => {
            tables.SelectedBuilding.set({
              value: entity,
            });
          })
          .onHoverEnter(() => {
            const action = tables.SelectedAction.get()?.value;
            // remove annoying tooltips when moving or placing buildings
            if (action !== Action.MoveBuilding && action !== Action.PlaceBuilding) {
              tables.HoverEntity.set({
                value: entity,
              });
            }

            if (tables.SelectedBuilding.get()?.value === entity) return;

            building.setOutline(0x808080, 3);
          })
          .onHoverExit(() => {
            tables.HoverEntity.remove();

            if (tables.SelectedBuilding.get()?.value === entity) return;

            building.clearOutline();
          });

        // buildings.set(entity, building);
        // trigger the build anim if it's a new placement (not when game is initializing)
        if (initialBuildingsPlaced) building.triggerPlacementAnim();
      };

      tables.SelectedBuilding.watch({
        world: spectateWorld,
        onUpdate: ({ properties: { current, prev } }) => {
          if (current?.value === prev?.value) return;

          const newBuilding = objects.building.get(current?.value as Entity);
          if (newBuilding) {
            scene.audio.play("DataPoint5", "ui", { volume: 0.5 });
            newBuilding.clearOutline();
            newBuilding.setOutline(0x00ffff, 3);
          }

          const oldBuilding = objects.building.get(prev?.value as Entity);
          if (oldBuilding) oldBuilding.clearOutline();
        },
      });

      $query(positionQuery, {
        world: systemsWorld,
        onEnter: render,
        onChange: ({ entity, table }) => {
          render({ entity, showLevelAnimation: table.id === tables.Level.id });
        },
        onExit: ({ entity }) => {
          const building = objects.building.get(entity);
          if (building) building.destroy();
        },
      });
    },
  });
};
