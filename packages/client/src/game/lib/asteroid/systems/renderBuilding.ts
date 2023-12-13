import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  Entity,
  Has,
  HasValue,
  NotValue,
  defineComponentSystem,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  namespaceWorld,
  runQuery,
} from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";

import { Scene } from "engine/types";
import { world } from "src/network/world";
import { safeIndex } from "src/util/array";

import { Assets, AudioKeys, DepthLayers, EntityIDtoAnimationKey, EntitytoSpriteKey, SpriteKeys } from "@game/constants";
import { components } from "src/network/components";
import { getBuildingDimensions, getBuildingTopLeft } from "src/util/building";
import {
  ObjectPosition,
  OnComponentSystem,
  OnHover,
  OnUpdateSystem,
  SetValue,
} from "../../common/object-components/common";
import { Animation, Outline, Texture } from "../../common/object-components/sprite";
import { EntityType } from "src/util/constants";
import { createAudioApi } from "src/game/api/audio";
import { getRandomRange } from "src/util/common";

const MAX_SIZE = 2 ** 15 - 1;
export const renderBuilding = (scene: Scene) => {
  const { tileHeight, tileWidth } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");
  const _gameWorld = namespaceWorld(world, "game_specate");
  const audio = createAudioApi(scene);

  defineComponentSystem(gameWorld, components.ActiveRock, ({ value }) => {
    world.dispose("game_specate");

    const positionQuery = [
      HasValue(components.Position, {
        parent: value[0]?.value,
      }),
      Has(components.BuildingType),
      Has(components.IsActive),
    ];

    const oldPositionQuery = [
      HasValue(components.Position, {
        parent: value[1]?.value,
      }),
      Has(components.BuildingType),
      Has(components.IsActive),
      NotValue(components.BuildingType, { value: EntityType.MainBase }),
    ];

    for (const entity of runQuery(oldPositionQuery)) {
      const renderId = `${entity}_entitySprite`;
      scene.objectPool.removeGroup(renderId);
    }

    // for (const entity of runQuery(oldPositionQuery)) {
    //   const renderId = `${entity}_entitySprite`;
    //   scene.objectPool.removeGroup(renderId);
    // }

    const render = ({ entity }: { entity: Entity }) => {
      // const entityId = world.entities[entity];
      const renderId = `${entity}_entitySprite`;

      const buildingType = components.BuildingType.get(entity)?.value as Entity | undefined;

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

      const active = components.IsActive.get(entity)?.value;
      const sharedComponents = [
        ObjectPosition({
          x: pixelCoord.x,
          y: -pixelCoord.y + buildingDimensions.height * tileHeight,
        }),
        SetValue({
          originY: 1,
        }),
        OnUpdateSystem([...positionQuery, Has(components.Level)], () => {
          const isActive = components.IsActive.get(entity)?.value;
          const updatedAssetPair = getAssetKeyPair(entity, buildingType);
          buildingSprite.setComponents([
            Texture(Assets.SpriteAtlas, updatedAssetPair.sprite),
            updatedAssetPair.animation ? Animation(updatedAssetPair.animation, !isActive) : undefined,
            SetValue({ tint: isActive ? 0xffffff : 0x777777 }),
          ]);
        }),
        SetValue({ tint: active ? 0xffffff : 0x777777 }),
        assetPair.animation ? Animation(assetPair.animation, !active) : undefined,
        OnComponentSystem(components.IsActive, (object, { entity: _entity }) => {
          if (entity !== _entity) return;
          const updatedAssetPair = getAssetKeyPair(entity, buildingType);
          const isActive = components.IsActive.get(entity)?.value;
          if (!isActive) {
            buildingSprite.setComponents([
              SetValue({ tint: 0x777777 }),
              updatedAssetPair.animation ? Animation(updatedAssetPair.animation, true) : undefined,
            ]);
          } else {
            buildingSprite.setComponents([
              SetValue({ tint: 0xffffff }),
              updatedAssetPair.animation ? Animation(updatedAssetPair.animation) : undefined,
            ]);
          }
        }),
        Texture(Assets.SpriteAtlas, assetPair.sprite),
      ];

      buildingSprite.setComponents([
        SetValue({
          depth: DepthLayers.Building - tilePosition.y + buildingDimensions.height,
        }),
        OnHover(
          () => {
            components.HoverEntity.set({ value: entity });
          },
          () => {
            components.HoverEntity.remove();
          }
        ),
        ...sharedComponents,
      ]);

      buildingSpriteOutline.setComponents([
        SetValue({ depth: DepthLayers.Building, alpha: 0 }),
        OnComponentSystem(components.SelectedBuilding, (gameObject) => {
          if (buildingSpriteOutline.hasComponent("select_outline")) {
            if (components.SelectedBuilding.get()?.value === entity) return;
            buildingSpriteOutline.removeComponent("select_outline");
            gameObject.setAlpha(0);
          }

          if (components.SelectedBuilding.get()?.value === entity) {
            gameObject.clearFX();
            buildingSpriteOutline.setComponent(Outline({ id: "select_outline", knockout: true, color: 0x00ffff }));
            gameObject.setAlpha(1);
            audio.play(AudioKeys.Confirm, "ui", {
              volume: 0.5,
              detune: getRandomRange(-10, 10),
            });
            return;
          }
        }),
        OnComponentSystem(components.HoverEntity, (gameObject) => {
          if (
            buildingSpriteOutline.hasComponent("hover_outline") &&
            components.SelectedBuilding.get()?.value !== entity
          ) {
            if (components.HoverEntity.get()?.value === entity) return;
            buildingSpriteOutline.removeComponent("hover_outline");
            gameObject.setAlpha(0);
          }

          if (components.HoverEntity.get()?.value === entity && components.SelectedBuilding.get()?.value !== entity) {
            buildingSpriteOutline.setComponent(Outline({ id: "hover_outline", knockout: true, color: 0x808080 }));
            gameObject.setAlpha(1);
            audio.play(AudioKeys.DataPoint2, "ui", {
              volume: 0.1,
              detune: getRandomRange(-200, 200),
            });
            return;
          }
        }),
        ...sharedComponents,
      ]);
    };

    const throwDust = ({ entity }: { entity: Entity }) => {
      const buildingType = components.BuildingType.get(entity)?.value as Entity | undefined;

      if (!buildingType) return;

      const origin = components.Position.get(entity);
      if (!origin) return;
      const tilePosition = getBuildingTopLeft(origin, buildingType);

      // don't render beyond coord map limitation
      if (Math.abs(tilePosition.x) > MAX_SIZE || Math.abs(tilePosition.y) > MAX_SIZE) return;

      const pixelCoord = tileCoordToPixelCoord(tilePosition as Coord, tileWidth, tileHeight);

      const buildingDimensions = getBuildingDimensions(buildingType);

      //throw up dust on build
      flare(
        scene,
        {
          x: pixelCoord.x + (tileWidth * buildingDimensions.width) / 2,
          y: -pixelCoord.y + (tileHeight * buildingDimensions.height) / 2,
        },
        buildingDimensions.width
      );
    };

    defineEnterSystem(_gameWorld, positionQuery, render);
    //dust particle animation on new building
    defineEnterSystem(_gameWorld, positionQuery, throwDust, { runOnInit: false });

    defineUpdateSystem(_gameWorld, positionQuery, (update) => {
      render(update);
      throwDust(update);
    });

    defineExitSystem(_gameWorld, positionQuery, ({ entity }) => {
      const renderId = `${entity}_entitySprite`;
      scene.objectPool.removeGroup(renderId);
    });
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

//temporary dust particle animation to test
const flare = (scene: Scene, coord: Coord, size = 1) => {
  scene.phaserScene.add
    .particles(coord.x, coord.y, "flare", {
      speed: 100,
      lifespan: 300 * size,
      quantity: 10,
      scale: { start: 0.3, end: 0 },
      tintFill: true,
      // emitting: true,
      color: [0x828282, 0xbfbfbf, 0xe8e8e8],
      // emitZone: { type: 'edge', source: , quantity: 42 },
      duration: 100,
    })
    .start();
};
