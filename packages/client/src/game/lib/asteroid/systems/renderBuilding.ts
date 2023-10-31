import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Entity, Has, HasValue, defineSystem, namespaceWorld } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";

import { Scene } from "engine/types";
import { singletonIndex, world } from "src/network/world";
import { safeIndex } from "src/util/array";

import { Assets, DepthLayers, EntityIDtoAnimationKey, EntitytoSpriteKey, SpriteKeys } from "@game/constants";
import { components } from "src/network/components";
import { SetupResult } from "src/network/types";
import { getBuildingDimensions, getBuildingTopLeft } from "src/util/building";
import { ObjectPosition, OnComponentSystem, OnUpdateSystem, SetValue } from "../../common/object-components/common";
import { Animation, Outline, Texture } from "../../common/object-components/sprite";

const MAX_SIZE = 2 ** 15 - 1;
export const renderBuilding = (scene: Scene, { network: { playerEntity } }: SetupResult) => {
  const { tileHeight, tileWidth } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const render = ({ entity }: { entity: Entity }) => {
    // const entityId = world.entities[entity];
    const renderId = `${entity}_entitySprite`;

    const buildingType = components.BuildingType.get(entity)?.value as Entity | undefined;

    const isOptimisticUpdate = entity === singletonIndex;

    if (!buildingType) return;

    const origin = components.Position.get(entity);
    if (!origin) return;
    const tilePosition = getBuildingTopLeft(origin, buildingType);

    // don't render beyond coord map limitation
    if (Math.abs(tilePosition.x) > MAX_SIZE || Math.abs(tilePosition.y) > MAX_SIZE) return;

    const pixelCoord = tileCoordToPixelCoord(tilePosition as Coord, tileWidth, tileHeight);

    scene.objectPool.removeGroup(renderId);
    const buildingRenderGroup = scene.objectPool.getGroup(renderId);

    const buildingSprite = buildingRenderGroup.add("Sprite");
    const buildingSpriteOutline = buildingRenderGroup.add("Sprite");

    const buildingDimensions = getBuildingDimensions(buildingType);
    const assetPair = getAssetKeyPair(entity, buildingType);

    const sharedComponents = [
      ObjectPosition({
        x: pixelCoord.x,
        y: -pixelCoord.y + buildingDimensions.height * tileHeight,
      }),
      SetValue({
        originY: 1,
      }),
      OnUpdateSystem([...positionQuery, Has(components.Level)], () => {
        const updatedAssetPair = getAssetKeyPair(entity, buildingType);
        buildingSprite.setComponents([
          Texture(Assets.SpriteAtlas, updatedAssetPair.sprite),
          updatedAssetPair.animation ? Animation(updatedAssetPair.animation) : undefined,
        ]);
      }),
      Texture(Assets.SpriteAtlas, assetPair.sprite),
      assetPair.animation ? Animation(assetPair.animation) : undefined,
    ];

    buildingSprite.setComponents([
      SetValue({
        depth: DepthLayers.Building - tilePosition.y + buildingDimensions.height,
        alpha: isOptimisticUpdate ? 0.5 : 1,
      }),
      ...sharedComponents,
    ]);

    buildingSpriteOutline.setComponents([
      SetValue({ depth: DepthLayers.Building, alpha: 0 }),
      OnComponentSystem(components.SelectedBuilding, (gameObject) => {
        if (components.SelectedBuilding.get()?.value === entity) {
          buildingSpriteOutline.setComponent(Outline({ knockout: true, color: 0x00ffff }));
          gameObject.setAlpha(1);
          return;
        }

        if (buildingSpriteOutline.hasComponent(Outline().id)) {
          buildingSpriteOutline.removeComponent(Outline().id);
          gameObject.setAlpha(0);
        }
      }),
      ...sharedComponents,
    ]);
  };

  const positionQuery = [
    HasValue(components.Position, {
      parent: components.Home.get(playerEntity)?.asteroid,
    }),
    Has(components.BuildingType),
  ];

  defineSystem(gameWorld, positionQuery, ({ entity, value: [newVal, oldVal] }) => {
    if (oldVal) {
      const renderId = `${entity}_entitySprite`;
      scene.objectPool.removeGroup(renderId);
    }
    if (newVal) {
      render({ entity });
    }
  });
};

function getAssetKeyPair(entityId: Entity, buildingType: Entity) {
  const sprites = EntitytoSpriteKey[buildingType];
  const animations = EntityIDtoAnimationKey[buildingType];

  const level = components.Level.get(entityId)?.value ? parseInt(components.Level.get(entityId)!.value.toString()) : 1;

  const spriteKey = sprites ? safeIndex(level - 1, sprites) : SpriteKeys.IronMine1;

  const animationKey = animations ? safeIndex(level - 1, animations) : undefined;

  return {
    sprite: spriteKey,
    animation: animationKey,
  };
}
