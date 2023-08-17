import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  EntityIndex,
  Has,
  defineComponentSystem,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";

import { Scene } from "engine/types";
import { world } from "src/network/world";
import { SelectedBuilding } from "src/network/components/clientComponents";
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
import { ObjectPosition } from "../../common/object-components/common";
import { getBuildingTopLeftCoord } from "src/util/building";

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

    scene.objectPool.remove(renderId);
    const buildingRenderEntity = scene.objectPool.get(renderId, "Sprite");

    const sprites = EntityIDtoSpriteKey[buildingType];
    const spriteKey = sprites ? safeIndex(level - 1, sprites) : SpriteKeys.Node;
    const animations = EntityIDtoAnimationKey[buildingType];
    const animationKey = animations
      ? safeIndex(level - 1, animations)
      : undefined;

    buildingRenderEntity.setComponents([
      ObjectPosition(
        { x: pixelCoord.x, y: -pixelCoord.y },
        DepthLayers.Building
      ),
      Texture(Assets.SpriteAtlas, spriteKey),
      animationKey ? Animation(animationKey) : undefined,
      selected ? Outline() : undefined,
    ]);
  };

  const positionQuery = [Has(Position), Has(BuildingType)];
  defineEnterSystem(gameWorld, positionQuery, render);

  const updateQuery = [Has(Position), Has(BuildingType), Has(Level)];
  defineUpdateSystem(gameWorld, updateQuery, render);

  defineExitSystem(gameWorld, positionQuery, ({ entity }) => {
    const renderId = `${entity}_entitySprite`;
    scene.objectPool.remove(renderId);
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
