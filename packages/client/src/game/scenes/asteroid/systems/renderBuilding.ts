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

import { world } from "src/network/world";

import { EntityType, Mode } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Building } from "../../../lib/objects/Building";
import { components } from "src/network/components";
import { getBuildingBottomLeft } from "src/util/building";
import { removeRaidableAsteroid } from "src/game/scenes/starmap/systems/utils/initializeSecondaryAsteroids";
import { EMap } from "contracts/config/enums";
import { isDomInteraction } from "@/util/canvas";
import { Coord } from "engine/types";
import { getBuildingDimensions } from "@/util/building";
import { PrimodiumScene } from "@/game/api/scene";

export const triggerBuildAnim = (scene: PrimodiumScene, entity: Entity, mapCoord: Coord) => {
  const flare = (absoluteCoord: Coord, size = 1) => {
    scene.phaserScene.add
      .particles(absoluteCoord.x, absoluteCoord.y, "flare", {
        speed: 100,
        lifespan: 300 * size,
        quantity: 10,
        scale: { start: 0.3, end: 0 },
        tintFill: true,
        color: [0x828282, 0xbfbfbf, 0xe8e8e8],
        duration: 100,
      })
      .start();
  };

  const {
    tiled: { tileWidth, tileHeight },
  } = scene;
  const buildingType = components.BuildingType.get(entity)?.value as Entity | undefined;
  if (!buildingType) return;

  const buildingDimensions = getBuildingDimensions(buildingType);
  // convert coords from bottom left to top left
  const mapCoordTopLeft = {
    x: mapCoord.x,
    y: mapCoord.y + buildingDimensions.height - 1,
  };
  const pixelCoord = scene.utils.tileCoordToPixelCoord(mapCoordTopLeft);

  // throw up dust on build
  flare(
    {
      x: pixelCoord.x + (tileWidth * buildingDimensions.width) / 2,
      y: -pixelCoord.y + (tileHeight * buildingDimensions.height) / 2,
    },
    buildingDimensions.width
  );
};

//TODO: Temp system implementation. Logic be replaced with state machine instead of direct obj manipulation
export const renderBuilding = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const spectateWorld = namespaceWorld(world, "game_spectate");
  const { objects } = scene;

  defineComponentSystem(systemsWorld, components.ActiveRock, async ({ value }) => {
    //sleep 1 second to allow for building to be removed
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
    defineEnterSystem(
      spectateWorld,
      positionQuery,
      ({ entity }) => {
        if (components.SelectedMode.get()?.value === Mode.Spectate) return;

        const origin = components.Position.get(entity);
        const buildingPrototype = components.BuildingType.get(entity)?.value as Entity | undefined;
        if (!origin || !buildingPrototype) return;
        const tileCoord = getBuildingBottomLeft(origin, buildingPrototype);

        triggerBuildAnim(scene, entity, tileCoord);
      },
      { runOnInit: false }
    );
    defineUpdateSystem(spectateWorld, positionQuery, render);

    defineExitSystem(spectateWorld, positionQuery, ({ entity }) => {
      const building = objects.building.get(entity);
      if (building) {
        building.destroy();
      }
    });
  });
};
