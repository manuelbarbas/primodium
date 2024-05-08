import {
  Entity,
  Has,
  HasValue,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { SceneApi } from "@/game/api/scene";
import { DepthLayers } from "src/game/lib/constants/common";
import { components } from "src/network/components";
import { buildBuilding } from "src/network/setup/contractCalls/buildBuilding";
import { MUD } from "src/network/types";
import { world } from "src/network/world";
import { getBuildingDimensions, getBuildingOrigin, validateBuildingPlacement } from "src/util/building";
import { getEntityTypeName } from "src/util/common";
import { Action, BuildingEnumLookup } from "src/util/constants";
import { getRecipe, hasEnoughResources } from "src/util/recipe";
import { Building } from "../../../lib/objects/Building";

export const handleClick = (pointer: Phaser.Input.Pointer, mud: MUD, scene: SceneApi) => {
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
    if (!hasEnough) scene.notify("error", "Not enough resources to build " + getEntityTypeName(buildingPrototype));
    if (!validPlacement) scene.notify("error", "Cannot place building here");
    scene.camera.shake();
    return;
  }

  const buildingOrigin = getBuildingOrigin(tileCoord, buildingPrototype);
  if (!buildingOrigin) return;

  buildBuilding(mud, BuildingEnumLookup[buildingPrototype], buildingOrigin);
  components.SelectedAction.remove();
  components.SelectedBuilding.remove();
};

export const renderBuildingPlacementTool = (scene: SceneApi, mud: MUD) => {
  const systemsWorld = namespaceWorld(world, "systems");

  const query = [
    Has(components.HoverTile),
    HasValue(components.SelectedAction, {
      value: Action.PlaceBuilding,
    }),
  ];

  let placementBuilding: Building | undefined;
  const render = () => {
    const buildingPrototype = components.SelectedBuilding.get()?.value;

    const tileCoord = components.HoverTile.get();

    if (!tileCoord || !buildingPrototype) return;

    const buildingDimensions = getBuildingDimensions(buildingPrototype);

    const asteroid = components.ActiveRock.get()?.value as Entity;
    if (!asteroid) throw new Error("No active rock active");
    const hasEnough = hasEnoughResources(getRecipe(buildingPrototype, 1n), asteroid);
    const validPlacement = validateBuildingPlacement(tileCoord, buildingPrototype, asteroid);

    if (!placementBuilding) {
      placementBuilding = new Building(scene, buildingPrototype, tileCoord).spawn();

      placementBuilding.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        handleClick(pointer, mud, scene);
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

  defineEnterSystem(systemsWorld, query, () => {
    render();

    console.info("[ENTER SYSTEM](renderBuildingPlacement) Building placement tool has been added");
  });

  defineUpdateSystem(systemsWorld, query, render);

  defineExitSystem(systemsWorld, query, () => {
    placementBuilding?.dispose();
    placementBuilding = undefined;
  });
};
