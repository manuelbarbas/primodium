import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  ComponentUpdate,
  Has,
  HasValue,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { Action } from "src/util/constants";
import {
  HoverTile,
  SelectedAction,
  SelectedBuilding,
} from "src/network/components/clientComponents";
import { world } from "src/network/world";
import {
  ObjectPosition,
  SetValue,
} from "../../common/object-components/common";
import { AsteroidMap } from "@game/constants";
import {
  Texture,
  Animation,
  Outline,
} from "../../common/object-components/sprite";

const {
  EntityIDtoAnimationKey,
  EntityIDtoSpriteKey,
  Assets,
  SpriteKeys,
  DepthLayers,
} = AsteroidMap;

export const renderBuildingPlacementTool = (scene: Scene) => {
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

    buildingTool.setComponents([
      ObjectPosition(
        {
          x: pixelCoord.x,
          y: -pixelCoord.y,
        },
        DepthLayers.Marker
      ),
      Texture(Assets.SpriteAtlas, sprite ?? SpriteKeys.Node),
      animation ? Animation(animation) : undefined,
      Outline({
        thickness: 3,
        color: 0x000000,
      }),
      Outline({
        thickness: 5,
      }),
      SetValue({
        alpha: 0.9,
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
