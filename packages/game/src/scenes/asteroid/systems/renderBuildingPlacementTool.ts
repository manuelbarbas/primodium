import { Action, Core, getEntityTypeName } from "@primodiumxyz/core";
import { $query, Entity, namespaceWorld } from "@primodiumxyz/reactive-tables";

import { Building } from "@/lib/objects/building";
import { PrimodiumScene } from "@/types";
import { DepthLayers } from "@/lib/constants/common";

export const handleClick = (pointer: Phaser.Input.Pointer, core: Core, scene: PrimodiumScene) => {
  const { tables, utils } = core;

  if (pointer?.rightButtonDown()) {
    tables.SelectedAction.remove();
    return;
  }

  const asteroid = tables.ActiveRock.get()?.value;
  const buildingPrototype = tables.SelectedBuilding.get()?.value;
  const tileCoord = tables.HoverTile.get();

  if (!asteroid || !buildingPrototype || !tileCoord) return;

  const hasEnough = utils.hasEnoughResources(utils.getRecipe(buildingPrototype, 1n), asteroid);
  const validPlacement = utils.validateBuildingPlacement(tileCoord, buildingPrototype, asteroid);

  if (!hasEnough || !validPlacement) {
    if (!hasEnough) scene.notify("error", "Not enough resources to build " + getEntityTypeName(buildingPrototype));
    if (!validPlacement) scene.notify("error", "Cannot place building here");
    scene.camera.shake();
    return;
  }

  const buildingOrigin = utils.getBuildingOrigin(tileCoord, buildingPrototype);
  if (!buildingOrigin) return;

  // buildBuilding(mud, BuildingEnumLookup[buildingPrototype], buildingOrigin);
  tables.SelectedAction.remove();
  tables.SelectedBuilding.remove();
};

export const renderBuildingPlacementTool = (scene: PrimodiumScene, core: Core) => {
  const {
    network: { world },
    tables,
    utils,
  } = core;
  const systemsWorld = namespaceWorld(world, "systems");

  let placementBuilding: Building | undefined;
  const render = () => {
    const buildingPrototype = tables.SelectedBuilding.get()?.value;

    const tileCoord = tables.HoverTile.get();

    if (!tileCoord || !buildingPrototype) return;

    const buildingDimensions = utils.getBuildingDimensions(buildingPrototype);

    const asteroid = tables.ActiveRock.get()?.value as Entity;
    if (!asteroid) throw new Error("No active rock active");
    const hasEnough = utils.hasEnoughResources(utils.getRecipe(buildingPrototype, 1n), asteroid);
    const validPlacement = utils.validateBuildingPlacement(tileCoord, buildingPrototype, asteroid);

    if (!placementBuilding) {
      placementBuilding = new Building({
        id: "placementTool" as Entity,
        scene,
        buildingType: buildingPrototype,
        coord: tileCoord,
        dimensions: buildingDimensions,
      });

      placementBuilding.onClick((pointer: Phaser.Input.Pointer) => {
        handleClick(pointer, core, scene);
      });
    }

    placementBuilding
      .setBuildingType(buildingPrototype)
      .setCoordPosition({ x: tileCoord.x, y: tileCoord.y - buildingDimensions.height + 1 })
      .setAlpha(0.9)
      .clearOutline()
      .setOrigin(0, 1)
      .setDepth(validPlacement ? DepthLayers.Building - tileCoord.y + buildingDimensions.height : DepthLayers.Building);

    if (hasEnough && validPlacement) {
      placementBuilding.setTint(0xffffff).setOutline(0xffff00, 3);
    } else {
      placementBuilding.setTint(0xff0000).setOutline(0xff0000, 3);
    }
  };

  const query = {
    with: [tables.HoverTile],
    withProperties: [
      {
        table: tables.SelectedAction,
        properties: {
          value: Action.PlaceBuilding,
        },
      },
    ],
  };

  $query(query, {
    world: systemsWorld,
    onEnter: () => {
      render();
      console.info("[ENTER SYSTEM](renderBuildingPlacement) Building placement tool has been added");
    },
    onUpdate: render,
    onExit: () => {
      placementBuilding?.destroy();
      placementBuilding = undefined;
    },
  });
};
