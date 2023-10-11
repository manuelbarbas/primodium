import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { ComponentUpdate, Entity, Has, HasValue } from "@latticexyz/recs";
import { defineEnterSystem, defineExitSystem, defineUpdateSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { Action, BuildingTypes } from "src/util/constants";
import { world } from "src/network/world";
import { ObjectPosition, OnClick, SetValue } from "../../common/object-components/common";
import { Texture, Animation, Outline } from "../../common/object-components/sprite";
import { validateBuildingPlacement, getBuildingDimensions, getBuildingOrigin } from "src/util/building";
import { getRecipe, hasEnoughResources } from "src/util/resource";
import { toast } from "react-toastify";
import { getBlockTypeName } from "src/util/common";
import { Assets, DepthLayers, EntityIDtoAnimationKey, EntityIDtoSpriteKey, SpriteKeys } from "@game/constants";
import { components } from "src/network/components";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { SetupResult } from "src/network/types";
import { buildBuilding } from "src/util/web3/contractCalls/buildBuilding";

export const renderBuildingPlacementTool = (scene: Scene, mud: SetupResult) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");
  const objIndexSuffix = "_buildingPlacement";
  const playerEntity = mud.network.playerEntity;

  const query = [
    Has(components.HoverTile),
    HasValue(components.SelectedAction, {
      value: Action.PlaceBuilding,
    }),
  ];

  const render = (update: ComponentUpdate) => {
    const objIndex = update.entity + objIndexSuffix;
    const selectedBuilding = components.SelectedBuilding.get()?.value;

    const tileCoord = components.HoverTile.get();

    if (!tileCoord || !selectedBuilding) return;

    const pixelCoord = tileCoordToPixelCoord(tileCoord, tileWidth, tileHeight);

    scene.objectPool.remove(objIndex);

    const buildingTool = scene.objectPool.get(objIndex, "Sprite");

    const sprite = EntityIDtoSpriteKey[selectedBuilding][0];
    const animation = EntityIDtoAnimationKey[selectedBuilding]
      ? EntityIDtoAnimationKey[selectedBuilding][0]
      : undefined;

    const buildingDimensions = getBuildingDimensions(selectedBuilding);

    const hasEnough = hasEnoughResources(getRecipe(selectedBuilding, 1n));
    const validPlacement = validateBuildingPlacement(
      tileCoord,
      selectedBuilding,
      (components.Home.get(playerEntity)?.asteroid as Entity | undefined) ?? singletonEntity
    );

    buildingTool.setComponents([
      ObjectPosition(
        {
          x: pixelCoord.x,
          y: -pixelCoord.y + buildingDimensions.height * tileHeight,
        },
        !validPlacement ? DepthLayers.Building : DepthLayers.Building - tileCoord.y + buildingDimensions.height
      ),
      SetValue({
        alpha: 0.9,
        originY: 1,
        tint: hasEnough ? 0xffffff : 0xff0000,
      }),
      Texture(Assets.SpriteAtlas, sprite ?? SpriteKeys.IronMine1),
      animation ? Animation(animation) : undefined,
      Outline({
        thickness: 3,
        color: hasEnough && validPlacement ? undefined : 0xff0000,
      }),
      OnClick(
        scene,
        (_, pointer) => {
          //remove tooltip on right click
          if (pointer?.rightButtonDown()) {
            components.SelectedAction.remove();
            return;
          }

          if (!hasEnough || !validPlacement) {
            if (!hasEnough) toast.error("Not enough resources to build " + getBlockTypeName(selectedBuilding));
            if (!validPlacement) toast.error("Cannot place building here");
            scene.camera.phaserCamera.shake(200, 0.001);
            return;
          }

          const buildingOrigin = getBuildingOrigin(tileCoord, selectedBuilding);
          if (!buildingOrigin) return;

          buildBuilding(mud.network, BuildingTypes[selectedBuilding], buildingOrigin);
          components.SelectedAction.remove();
        },
        true
      ),
    ]);
  };

  defineEnterSystem(gameWorld, query, (update) => {
    render(update);

    console.info("[ENTER SYSTEM](renderBuildingPlacement) Building placement tool has been added");
  });

  defineUpdateSystem(gameWorld, query, render);

  defineExitSystem(gameWorld, query, (update) => {
    const objIndex = update.entity + objIndexSuffix;

    scene.objectPool.remove(objIndex);

    console.info("[EXIT SYSTEM](renderBuildingPlacement) Building placement tool has been removed");
  });
};
