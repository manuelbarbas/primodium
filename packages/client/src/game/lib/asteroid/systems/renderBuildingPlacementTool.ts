import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { ComponentUpdate, Has, HasValue } from "@latticexyz/recs";
import {
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { Action } from "src/util/constants";
import {
  Account,
  HoverTile,
  SelectedAction,
  SelectedBuilding,
} from "src/network/components/clientComponents";
import { world } from "src/network/world";
import {
  ObjectPosition,
  OnClick,
  SetValue,
} from "../../common/object-components/common";
import { AsteroidMap } from "@game/constants";
import {
  Texture,
  Animation,
  Outline,
} from "../../common/object-components/sprite";
import { getBuildingDimensions, getBuildingOrigin } from "src/util/building";
import { hasEnoughResources } from "src/util/resource";
import { hashAndTrimKeyEntity, hashKeyEntity } from "src/util/encode";
import { Level } from "src/network/components/chainComponents";
import { buildBuilding } from "src/util/web3";
import { Network } from "src/network/layer";

const {
  EntityIDtoAnimationKey,
  EntityIDtoSpriteKey,
  Assets,
  SpriteKeys,
  DepthLayers,
} = AsteroidMap;

export const renderBuildingPlacementTool = (scene: Scene, network: Network) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");
  const objIndexSuffix = "_buildingPlacement";

  const query = [
    Has(HoverTile),
    HasValue(SelectedAction, {
      value: Action.PlaceBuilding,
    }),
  ];

  const render = (update: ComponentUpdate) => {
    const entityIndex = update.entity;
    const objIndex = update.entity + objIndexSuffix;
    const selectedBuilding = SelectedBuilding.get()?.value;
    const player = Account.get()?.value!;

    // Avoid updating on optimistic overrides
    if (
      !selectedBuilding ||
      typeof entityIndex !== "number" ||
      entityIndex >= world.entities.length
    ) {
      return;
    }

    const tileCoord = HoverTile.get(world.entities[entityIndex]);
    if (!tileCoord) return;

    const pixelCoord = tileCoordToPixelCoord(tileCoord, tileWidth, tileHeight);

    scene.objectPool.remove(objIndex);

    const buildingTool = scene.objectPool.get(objIndex, "Sprite");

    const sprite = EntityIDtoSpriteKey[selectedBuilding][0];
    const animation = EntityIDtoAnimationKey[selectedBuilding]
      ? EntityIDtoAnimationKey[selectedBuilding][0]
      : undefined;

    const buildingDimensions = getBuildingDimensions(selectedBuilding);

    const level =
      Level.get(hashKeyEntity(selectedBuilding, player))?.value ?? 1;
    const buildingLevelEntity = hashAndTrimKeyEntity(selectedBuilding, level);

    const hasEnough = hasEnoughResources(buildingLevelEntity);

    buildingTool.setComponents([
      ObjectPosition(
        {
          x: pixelCoord.x,
          y: -pixelCoord.y + buildingDimensions.height * tileHeight,
        },
        DepthLayers.Building - tileCoord.y + buildingDimensions.height
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
        color: hasEnough ? undefined : 0xff0000,
      }),
      OnClick(() => {
        if (!hasEnough) {
          scene.camera.phaserCamera.shake(200, 0.001);
          return;
        }

        const buildingOrigin = getBuildingOrigin(tileCoord, selectedBuilding);
        if (!buildingOrigin) return;
        buildBuilding(buildingOrigin, selectedBuilding, player, network);
        SelectedAction.remove();
      }),
    ]);
  };

  defineEnterSystem(gameWorld, query, (update) => {
    render(update);

    console.info(
      "[ENTER SYSTEM](renderBuildingPlacement) Building placement tool has been added"
    );
  });

  defineUpdateSystem(gameWorld, query, render);

  defineExitSystem(gameWorld, query, (update) => {
    const objIndex = update.entity + objIndexSuffix;

    scene.objectPool.remove(objIndex);

    console.info(
      "[EXIT SYSTEM](renderBuildingPlacement) Building placement tool has been removed"
    );
  });
};
