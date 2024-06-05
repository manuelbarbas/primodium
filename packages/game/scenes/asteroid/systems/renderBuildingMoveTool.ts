import {
  Entity,
  Has,
  HasValue,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { toHex } from "viem";
import { components } from "@primodiumxyz/core/network/components";
import { moveBuilding } from "@primodiumxyz/core/network/setup/contractCalls/moveBuilding";
import { MUD } from "@primodiumxyz/core/network/types";
import { world } from "@primodiumxyz/core/network/world";
import {
  getBuildingBottomLeft,
  getBuildingDimensions,
  getBuildingOrigin,
  validateBuildingPlacement,
} from "@primodiumxyz/core/util/building";
import { Action } from "@primodiumxyz/core/util/constants";
import { isDomInteraction } from "@primodiumxyz/core/util/canvas";
import { hashEntities } from "@primodiumxyz/core/util/encode";

import { Building, BuildingConstruction } from "@/lib/objects/building";
import { DepthLayers } from "@/lib/constants/common";
import { PrimodiumScene } from "@/api/scene";

export const handleClick = (pointer: Phaser.Input.Pointer, mud: MUD, scene: PrimodiumScene) => {
  if (pointer?.rightButtonDown()) {
    components.SelectedAction.remove();
    return;
  }

  const selectedBuilding = components.SelectedBuilding.get()?.value;
  if (!selectedBuilding) return;
  const selectedBuildingObj = scene.objects.building.get(selectedBuilding);

  const tileCoord = components.HoverTile.get();
  const activeRock = components.ActiveRock.get()?.value as Entity;
  const buildingPrototype = components.BuildingType.get(selectedBuilding)?.value as Entity | undefined;

  if (!tileCoord || !buildingPrototype || !activeRock) return;

  const validPlacement = validateBuildingPlacement(tileCoord, buildingPrototype, activeRock, selectedBuilding);

  if (!validPlacement) {
    scene.notify("error", "Cannot place building here");
    scene.camera.phaserCamera.shake(200, 0.001);
    return;
  }

  const buildingOrigin = getBuildingOrigin(tileCoord, buildingPrototype);
  if (!buildingOrigin) return;

  // change opacity and place construction building
  const placeholderBuilding = new BuildingConstruction({
    id: hashEntities(toHex("placeholder"), selectedBuilding),
    scene,
    coord: getBuildingBottomLeft(buildingOrigin, buildingPrototype),
    buildingDimensions: getBuildingDimensions(buildingPrototype),
  }).spawn();

  const pendingAnim = scene.phaserScene.tweens.add({
    targets: [selectedBuildingObj, placeholderBuilding],
    alpha: 0.6,
    duration: 600,
    yoyo: true,
    repeat: -1,
  });

  moveBuilding(
    mud,
    selectedBuilding,
    buildingOrigin,
    // on completion
    () => {
      pendingAnim.destroy();
      placeholderBuilding.destroy();
      selectedBuildingObj?.setAlpha(1);
    }
  );
  components.SelectedAction.remove();
};

//TODO: Temp system implementation. Logic be replaced with state machine instead of direct obj manipulation
export const renderBuildingMoveTool = (scene: PrimodiumScene, mud: MUD) => {
  const systemsWorld = namespaceWorld(world, "systems");

  let placementBuilding: Building | undefined;

  const render = () => {
    const selectedBuilding = components.SelectedBuilding.get()?.value;
    if (!selectedBuilding) return;
    const buildingPrototype = components.BuildingType.get(selectedBuilding)?.value as Entity | undefined;

    const tileCoord = components.HoverTile.get();

    if (!tileCoord || !buildingPrototype) return;

    const buildingDimensions = getBuildingDimensions(buildingPrototype);

    const activeRock = components.ActiveRock.get()?.value as Entity;
    const validPlacement = validateBuildingPlacement(
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
      });
      // .spawn();

      placementBuilding.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        if (isDomInteraction(pointer, "down")) return;
        handleClick(pointer, mud, scene);
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

  const query = [
    Has(components.HoverTile),
    HasValue(components.SelectedAction, {
      value: Action.MoveBuilding,
    }),
  ];

  defineEnterSystem(systemsWorld, query, render);
  defineUpdateSystem(systemsWorld, query, render);

  defineExitSystem(systemsWorld, query, () => {
    placementBuilding?.destroy();
    placementBuilding = undefined;
  });
};
