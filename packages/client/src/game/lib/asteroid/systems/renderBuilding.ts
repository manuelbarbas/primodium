import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  EntityIndex,
  Has,
  defineComponentSystem,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
} from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { clamp } from "lodash";

import { Scene } from "engine/types";
import { world } from "src/network/world";
import {
  Position,
  SelectedBuilding,
} from "src/network/components/clientComponents";
import { Level, BuildingType } from "src/network/components/chainComponents";
import { safeIndex } from "src/util/array";
import { AsteroidMap } from "@game/constants";

import {
  SpriteAnimation,
  SpriteTexture,
  SpriteOutline,
} from "../../common/object-components/sprite";
import { ObjectPosition } from "../../common/object-components/common";

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

  const render = ({ entity }: { entity: EntityIndex }) => {
    const entityId = world.entities[entity];
    const renderId = `${entity}_entitySprite`;
    const tilePosition = Position.get(entityId);
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

    scene.objectPool.remove(renderId);
    const buildingRenderEntity = scene.objectPool.get(renderId, "Sprite");

    const sprites = EntityIDtoSpriteKey[buildingType];
    const spriteKey = sprites ? safeIndex(level - 1, sprites) : SpriteKeys.Node;

    buildingRenderEntity.setComponents([
      ObjectPosition(
        { x: pixelCoord.x, y: -pixelCoord.y },
        DepthLayers.Building
      ),
      SpriteTexture(Assets.SpriteAtlas, spriteKey),
    ]);

    const animations = EntityIDtoAnimationKey[buildingType];

    const anim = animations
      ? animations[clamp(level, animations.length) - 1]
      : undefined;

    animations && animations.length >= level
      ? animations[level - 1]
      : undefined;

    if (anim) buildingRenderEntity.setComponent(SpriteAnimation(anim));

    if (selected) buildingRenderEntity.setComponent(SpriteOutline());
  };

  const positionQuery = [Has(Position), Has(BuildingType)];
  defineEnterSystem(world, positionQuery, render);

  const updateQuery = [Has(Position), Has(BuildingType), Has(Level)];
  defineUpdateSystem(world, updateQuery, render);

  defineExitSystem(world, positionQuery, ({ entity }) => {
    const renderId = `${entity}_entitySprite`;
    scene.objectPool.remove(renderId);
  });

  defineComponentSystem(
    world,
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
