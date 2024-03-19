import { DepthLayers } from "@game/constants";
import {
  ComponentUpdate,
  Entity,
  Has,
  HasValue,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { toast } from "react-toastify";
import { components } from "src/network/components";
import { buildBuilding } from "src/network/setup/contractCalls/buildBuilding";
import { MUD } from "src/network/types";
import { world } from "src/network/world";
import { getBuildingDimensions, getBuildingOrigin, validateBuildingPlacement } from "src/util/building";
import { getBlockTypeName } from "src/util/common";
import { Action, BuildingEnumLookup } from "src/util/constants";
import { getRecipe, hasEnoughResources } from "src/util/recipe";
import { Building } from "../objects/Building";

export const renderBuildingPlacementTool = (scene: Scene, mud: MUD) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const objIndexSuffix = "_buildingPlacement";

  const query = [
    Has(components.HoverTile),
    HasValue(components.SelectedAction, {
      value: Action.PlaceBuilding,
    }),
  ];

  let placementBuilding: Building | undefined;
  const render = (update: ComponentUpdate) => {
    const objIndex = update.entity + objIndexSuffix;
    const buildingPrototype = components.SelectedBuilding.get()?.value;

    const tileCoord = components.HoverTile.get();

    if (!tileCoord || !buildingPrototype) return;

    scene.objectPool.remove(objIndex);

    const buildingDimensions = getBuildingDimensions(buildingPrototype);

    const asteroid = components.ActiveRock.get()?.value as Entity;
    if (!asteroid) throw new Error("No active rock active");
    const hasEnough = hasEnoughResources(getRecipe(buildingPrototype, 1n), asteroid);
    const validPlacement = validateBuildingPlacement(tileCoord, buildingPrototype, asteroid);

    if (!placementBuilding) {
      placementBuilding = new Building(scene, buildingPrototype, tileCoord).spawn();

      placementBuilding.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        if (pointer?.rightButtonDown()) {
          components.SelectedAction.remove();
          return;
        }

        const asteroid = components.ActiveRock.get()?.value as Entity;
        const buildingPrototype = components.SelectedBuilding.get()?.value;
        const tileCoord = components.HoverTile.get();

        if (!asteroid || !buildingPrototype || !tileCoord) return;

        const hasEnough = hasEnoughResources(getRecipe(buildingPrototype, 1n), asteroid);
        const validPlacement = validateBuildingPlacement(tileCoord, buildingPrototype, asteroid);

        if (!hasEnough || !validPlacement) {
          if (!hasEnough) toast.error("Not enough resources to build " + getBlockTypeName(buildingPrototype));
          if (!validPlacement) toast.error("Cannot place building here");
          scene.camera.phaserCamera.shake(200, 0.001);
          return;
        }

        const buildingOrigin = getBuildingOrigin(tileCoord, buildingPrototype);
        if (!buildingOrigin) return;

        buildBuilding(mud, BuildingEnumLookup[buildingPrototype], buildingOrigin);
        components.SelectedAction.remove();
        components.SelectedBuilding.remove();
      });
    }

    placementBuilding
      .setBuildingType(buildingPrototype)
      .setCoordPosition({ x: tileCoord.x, y: tileCoord.y - buildingDimensions.height + 1 })
      .setAlpha(0.9)
      .clearOutline()
      .setOrigin(0, 1);

    placementBuilding.setDepth(
      validPlacement ? DepthLayers.Building - tileCoord.y + buildingDimensions.height : DepthLayers.Building
    );

    if (hasEnough && validPlacement) {
      placementBuilding.setTint(0xffffff).setOutline(0xffff00, 3);
    } else {
      placementBuilding.setTint(0xff0000).setOutline(0xff0000, 3);
    }
  };

  defineEnterSystem(systemsWorld, query, (update) => {
    render(update);

    console.info("[ENTER SYSTEM](renderBuildingPlacement) Building placement tool has been added");
  });

  defineUpdateSystem(systemsWorld, query, render);

  defineExitSystem(systemsWorld, query, () => {
    placementBuilding?.dispose();
    placementBuilding = undefined;
  });
};
