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
import { Scene } from "engine/types";
import { toast } from "react-toastify";
import { components } from "@/network/components";
import { moveBuilding } from "@/network/setup/contractCalls/moveBuilding";
import { MUD } from "@/network/types";
import { world } from "@/network/world";
import { getBuildingDimensions, getBuildingOrigin, validateBuildingPlacement } from "@/util/building";
import { Building } from "@/game/lib/objects/Building";
import { DepthLayers } from "@/game/lib/constants/common";
import { Action } from "@/util/constants";
import { isDomInteraction } from "@/util/canvas";

export const handleClick = (pointer: Phaser.Input.Pointer, mud: MUD, scene: Scene) => {
  if (pointer?.rightButtonDown()) {
    components.SelectedAction.remove();
    return;
  }

  const selectedBuilding = components.SelectedBuilding.get()?.value;
  if (!selectedBuilding) return;

  const tileCoord = components.HoverTile.get();
  const activeRock = components.ActiveRock.get()?.value as Entity;
  const buildingPrototype = components.BuildingType.get(selectedBuilding)?.value as Entity | undefined;

  if (!tileCoord || !buildingPrototype || !activeRock) return;

  const validPlacement = validateBuildingPlacement(tileCoord, buildingPrototype, activeRock, selectedBuilding);

  if (!validPlacement) {
    toast.error("Cannot place building here");
    scene.camera.phaserCamera.shake(200, 0.001);
    return;
  }

  const buildingOrigin = getBuildingOrigin(tileCoord, buildingPrototype);
  if (!buildingOrigin) return;

  moveBuilding(mud, selectedBuilding, buildingOrigin);
  components.SelectedAction.remove();
};

//TODO: Temp system implementation. Logic be replaced with state machine instead of direct obj manipulation
export const renderBuildingMoveTool = (scene: Scene, mud: MUD) => {
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
