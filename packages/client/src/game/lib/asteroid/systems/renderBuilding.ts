import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  EntityIndex,
  Has,
  HasValue,
  defineComponentSystem,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";

import { Scene } from "engine/types";
import { world } from "src/network/world";
import {
  ActiveAsteroid,
  SelectedBuilding,
} from "src/network/components/clientComponents";
import {
  Position,
  Level,
  BuildingType,
} from "src/network/components/chainComponents";
import { safeIndex } from "src/util/array";
import { AsteroidMap } from "@game/constants";

import {
  Animation,
  Texture,
  Outline,
} from "../../common/object-components/sprite";
import {
  ObjectPosition,
  SetValue,
} from "../../common/object-components/common";
import {
  getBuildingDimensions,
  getBuildingTopLeftCoord,
} from "src/util/building";

const {
  Assets,
  SpriteKeys,
  DepthLayers,
  EntityIDtoAnimationKey,
  EntityIDtoSpriteKey,
} = AsteroidMap;

const MAX_SIZE = 2 ** 15 - 1;
export const renderBuilding = (scene: Scene) => {
  const { tileHeight, tileWidth } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const render = ({ entity }: { entity: EntityIndex }) => {
    const entityId = world.entities[entity];
    const renderId = `${entity}_entitySprite`;
    const tilePosition = getBuildingTopLeftCoord(entityId);
    const buildingType = BuildingType.get(entityId)?.value;
    const level = Level.get(entityId)?.value
      ? parseInt(Level.get(entityId)!.value.toString())
      : 1;

    if (!buildingType || !tilePosition) return;

    const selected = SelectedBuilding.get()?.value === entityId;

    // don't render beyond coord map limitation
    if (
      Math.abs(tilePosition.x) > MAX_SIZE ||
      Math.abs(tilePosition.y) > MAX_SIZE
    )
      return;

    const pixelCoord = tileCoordToPixelCoord(
      tilePosition as Coord,
      tileWidth,
      tileHeight
    );

    scene.objectPool.removeGroup(renderId);
    const buildingRenderGroup = scene.objectPool.getGroup(renderId);

    const sprites = EntityIDtoSpriteKey[buildingType];
    const spriteKey = sprites
      ? safeIndex(level - 1, sprites)
      : SpriteKeys.IronMine1;
    const animations = EntityIDtoAnimationKey[buildingType];
    const animationKey = animations
      ? safeIndex(level - 1, animations)
      : undefined;

    const buildingDimensions = getBuildingDimensions(buildingType);

    const components = [
      ObjectPosition({
        x: pixelCoord.x,
        y: -pixelCoord.y + buildingDimensions.height * tileHeight,
      }),
      SetValue({
        originY: 1,
      }),
      Texture(Assets.SpriteAtlas, spriteKey),
    ];

    buildingRenderGroup.add("Sprite").setComponents([
      SetValue({
        depth:
          DepthLayers.Building - tilePosition.y + buildingDimensions.height,
      }),
      animationKey ? Animation(animationKey) : undefined,
      ...components,
    ]);

    if (selected)
      buildingRenderGroup
        .add("Sprite")
        .setComponents([
          SetValue({ depth: DepthLayers.Building }),
          Outline({ knockout: true }),
          ...components,
        ]);
  };

  const positionQuery = [
    HasValue(Position, {
      parent: ActiveAsteroid.get()?.value,
    }),
    Has(BuildingType),
  ];

  defineEnterSystem(gameWorld, positionQuery, render);

  const updateQuery = [...positionQuery, Has(Level)];
  defineUpdateSystem(gameWorld, updateQuery, render);

  defineExitSystem(gameWorld, positionQuery, ({ entity }) => {
    const renderId = `${entity}_entitySprite`;
    scene.objectPool.removeGroup(renderId);
  });

  defineComponentSystem(
    gameWorld,
    SelectedBuilding,
    ({ value: [newValue, oldValue] }) => {
      if (oldValue?.value) {
        const entityIndex = world.entityToIndex.get(oldValue.value);
        if (entityIndex) render({ entity: entityIndex });
      }
      if (newValue?.value) {
        const entityIndex = world.entityToIndex.get(newValue.value);
        if (entityIndex) render({ entity: entityIndex });
      }
    }
  );
};
