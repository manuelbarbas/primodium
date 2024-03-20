import { DepthLayers } from "@game/constants";
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
import { components } from "src/network/components";
import { moveBuilding } from "src/network/setup/contractCalls/moveBuilding";
import { MUD } from "src/network/types";
import { world } from "src/network/world";
import { getBuildingOrigin, validateBuildingPlacement } from "src/util/building";
import { Action } from "src/util/constants";
import { Building } from "../../../objects/Building";

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

    const activeRock = components.ActiveRock.get()?.value as Entity;
    const validPlacement = validateBuildingPlacement(
      tileCoord,
      buildingPrototype,
      activeRock ?? singletonEntity,
      selectedBuilding
    );

    if (!placementBuilding) {
      placementBuilding = new Building(scene, buildingPrototype, tileCoord).spawn();

      placementBuilding.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        handleClick(pointer, mud, scene);
      });
    }

    placementBuilding.setCoordPosition(tileCoord).setAlpha(0.9);

    if (validPlacement) placementBuilding.setTint(0xffffff).setDepth(DepthLayers.Building - tileCoord.y);
    else placementBuilding.setTint(0xff0000).setOutline(0xff0000, 3).setDepth(DepthLayers.Building);
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
    placementBuilding?.dispose();
    placementBuilding = undefined;
  });
};
