import { Entity, namespaceWorld, $query } from "@primodiumxyz/reactive-tables";
import { Action, Core } from "@primodiumxyz/core";

import { Building } from "@/lib/objects/building";
import { DepthLayers } from "@/lib/constants/common";
import { PrimodiumScene } from "@/api/scene";
import { singletonEntity } from "@latticexyz/store-sync/recs";

export const handleClick = (pointer: Phaser.Input.Pointer, core: Core, scene: PrimodiumScene) => {
  const {
    // network: { world },
    tables,
    utils,
  } = core;

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

  // // change opacity and place construction building
  // const placeholderBuilding = new BuildingConstruction({
  //   id: hashEntities(toHex("placeholder"), selectedBuilding),
  //   scene,
  //   coord: utils.getBuildingBottomLeft(buildingOrigin, buildingPrototype),
  //   buildingDimensions: utils.getBuildingDimensions(buildingPrototype),
  // }).spawn();

  // const pendingAnim = scene.phaserScene.tweens.add({
  //   targets: [selectedBuildingObj, placeholderBuilding],
  //   alpha: 0.6,
  //   duration: 600,
  //   yoyo: true,
  //   repeat: -1,
  // });

  // moveBuilding(
  //   mud,
  //   selectedBuilding,
  //   buildingOrigin,
  //   // on completion
  //   () => {
  //     pendingAnim.destroy();
  //     placeholderBuilding.destroy();
  //     selectedBuildingObj?.setAlpha(1);
  //   }
  // );
  tables.SelectedAction.remove();
};

//TODO: Temp system implementation. Logic be replaced with state machine instead of direct obj manipulation
export const renderBuildingMoveTool = (scene: PrimodiumScene, core: Core) => {
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
      activeRock ?? singletonEntity,
      selectedBuilding
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
        handleClick(pointer, core, scene);
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
    withoutProperties: [{ table: tables.SelectedAction, properties: { value: Action.MoveBuilding } }],
  };

  $query(systemsWorld, query, {
    onEnter: render,
    onChange: render,
    onExit: () => {
      placementBuilding?.destroy();
      placementBuilding = undefined;
    },
  });
};
