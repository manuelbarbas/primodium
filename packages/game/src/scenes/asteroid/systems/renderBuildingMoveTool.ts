import { toHex } from "viem";

import { Action, Core, hashEntities } from "@primodiumxyz/core";
import { $query, defaultEntity, Entity, namespaceWorld } from "@primodiumxyz/reactive-tables";
import { ContractCalls } from "@client/contractCalls/createContractCalls";
import { DepthLayers } from "@game/lib/constants/common";
import { Building, BuildingConstruction } from "@game/lib/objects/building";
import { PrimodiumScene } from "@game/types";

export const handleClick = (pointer: Phaser.Input.Pointer, core: Core, scene: PrimodiumScene, calls: ContractCalls) => {
  const { tables, utils } = core;

  if (pointer?.rightButtonDown()) {
    tables.SelectedAction.remove();
    return;
  }

  const selectedBuilding = tables.SelectedBuilding.get()?.value;
  if (!selectedBuilding) return;
  const selectedBuildingObj = scene.objects.building.get(selectedBuilding);

  const tileCoord = tables.HoverTile.get();
  const activeRock = tables.ActiveRock.get()?.value as Entity;
  const buildingPrototype = tables.BuildingType.get(selectedBuilding)?.value as Entity | undefined;

  if (!tileCoord || !buildingPrototype || !activeRock) return;

  const validPlacement = utils.validateBuildingPlacement(tileCoord, buildingPrototype, activeRock, selectedBuilding);

  if (!validPlacement) {
    scene.notify("error", "Cannot place building here");
    scene.camera.phaserCamera.shake(200, 0.001);
    return;
  }

  const buildingOrigin = utils.getBuildingOrigin(tileCoord, buildingPrototype);
  if (!buildingOrigin) return;

  // change opacity and place construction building
  const placeholderBuilding = new BuildingConstruction({
    id: hashEntities(toHex("placeholder"), selectedBuilding),
    scene,
    coord: utils.getBuildingBottomLeft(buildingOrigin, buildingPrototype),
    buildingDimensions: utils.getBuildingDimensions(buildingPrototype),
  }).spawn();

  const pendingAnim = scene.phaserScene.tweens.add({
    targets: [selectedBuildingObj, placeholderBuilding],
    alpha: 0.6,
    duration: 600,
    yoyo: true,
    repeat: -1,
  });

  calls.moveBuilding(
    selectedBuilding,
    buildingOrigin,
    // on completion
    () => {
      pendingAnim.destroy();
      placeholderBuilding.destroy();
      selectedBuildingObj?.setAlpha(1);
    },
  );
  tables.SelectedAction.remove();
};

//TODO: Temp system implementation. Logic be replaced with state machine instead of direct obj manipulation
export const renderBuildingMoveTool = (scene: PrimodiumScene, core: Core, calls: ContractCalls) => {
  const {
    network: { world },
    tables,
    utils,
  } = core;

  const systemsWorld = namespaceWorld(world, "systems");

  let placementBuilding: Building | undefined;

  const render = () => {
    const selectedBuilding = tables.SelectedBuilding.get()?.value;
    if (!selectedBuilding) return;
    const buildingPrototype = tables.BuildingType.get(selectedBuilding)?.value as Entity | undefined;

    const tileCoord = tables.HoverTile.get();

    if (!tileCoord || !buildingPrototype) return;

    const buildingDimensions = utils.getBuildingDimensions(buildingPrototype);

    const activeRock = tables.ActiveRock.get()?.value as Entity;
    const validPlacement = utils.validateBuildingPlacement(
      tileCoord,
      buildingPrototype,
      activeRock ?? defaultEntity,
      selectedBuilding,
    );

    if (!placementBuilding) {
      placementBuilding = new Building({
        id: "movementTool" as Entity,
        scene,
        buildingType: buildingPrototype,
        coord: tileCoord,
        dimensions: buildingDimensions,
      });
      // .spawn();

      placementBuilding.onClick((pointer: Phaser.Input.Pointer) => {
        handleClick(pointer, core, scene, calls);
      });
    }

    placementBuilding
      .setCoordPosition({ x: tileCoord.x, y: tileCoord.y - buildingDimensions.height + 1 })
      .setAlpha(0.9)
      .clearOutline()
      .setOrigin(0, 1)
      .setDepth(validPlacement ? DepthLayers.Building - tileCoord.y + buildingDimensions.height : DepthLayers.Building);

    if (validPlacement) {
      placementBuilding.setTint(0xffffff).setOutline(0xffff00, 3);
    } else {
      placementBuilding.setTint(0xff0000).setOutline(0xff0000, 3);
    }
  };

  const query = {
    with: [tables.HoverTile],
    withProperties: [{ table: tables.SelectedAction, properties: { value: Action.MoveBuilding } }],
  };

  $query(query, {
    world: systemsWorld,
    onEnter: render,
    onUpdate: render,
    onExit: () => {
      placementBuilding?.destroy();
      placementBuilding = undefined;
    },
  });
};
