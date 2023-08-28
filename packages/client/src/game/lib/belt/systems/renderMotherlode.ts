import { Scene } from "engine/types";
import {
  namespaceWorld,
  Has,
  defineEnterSystem,
  EntityIndex,
  HasValue,
  defineComponentSystem,
} from "@latticexyz/recs";
import {
  ObjectPosition,
  OnClick,
  SetValue,
} from "../../common/object-components/common";
import { Outline, Texture } from "../../common/object-components/sprite";
import {
  AsteroidType,
  Motherlode,
  Position,
  ReversePosition,
} from "src/network/components/chainComponents";
import { world } from "src/network/world";
import { MotherlodeSizeNames, MotherlodeTypeNames } from "src/util/constants";
import { EMotherlodeSize, ESpaceRockType } from "src/util/web3/types";
import { Send } from "src/network/components/clientComponents";
import { encodeCoord } from "src/util/encode";

export const renderMotherlode = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const query = [
    Has(AsteroidType),
    HasValue(AsteroidType, { value: ESpaceRockType.Motherlode }),
  ];

  const render = ({ entity }: { entity: EntityIndex }) => {
    const entityId = world.entities[entity];
    scene.objectPool.removeGroup("motherlode_" + entity);
    const motherlodeObjectGroup = scene.objectPool.getGroup(
      "motherlode_" + entity
    );
    const motherlodeData = Motherlode.get(world.entities[entity]);
    if (!motherlodeData) throw new Error("motherlode data not found");
    const sprite = `motherlode-${
      MotherlodeTypeNames[motherlodeData.motherlodeType]
    }-${MotherlodeSizeNames[motherlodeData.size]}`;
    const coord = Position.get(world.entities[entity]);
    if (!coord) return;

    const selectedTarget = Send.getDestination();

    const scale =
      motherlodeData.size == EMotherlodeSize.SMALL
        ? 1
        : motherlodeData.size == EMotherlodeSize.MEDIUM
        ? 2
        : 4;
    motherlodeObjectGroup.add("Sprite").setComponents([
      ObjectPosition({
        x: coord.x * tileWidth,
        y: -coord.y * tileHeight,
      }),
      selectedTarget && selectedTarget.entity === entityId
        ? Outline()
        : undefined,
      SetValue({
        originX: 0.5,
        originY: 0.5,
        scale,
      }),
      Texture(sprite),
      OnClick(() => {
        if (selectedTarget && selectedTarget.entity === entityId) {
          Send.remove();
          return;
        }

        Send.setDestination(coord);
      }),
    ]);
  };

  defineEnterSystem(gameWorld, query, render);

  defineComponentSystem(gameWorld, Send, ({ value: [newValue, oldValue] }) => {
    if (oldValue?.destinationX && oldValue?.destinationY) {
      console.log("old:", oldValue.destinationX, oldValue.destinationY);
      const entityId = ReversePosition.get(
        encodeCoord({ x: oldValue.destinationX, y: oldValue.destinationY })
      )?.value;
      if (entityId) {
        const asteroidType = AsteroidType.get(entityId)?.value;
        if (!asteroidType || asteroidType !== ESpaceRockType.Motherlode) return;

        const entityIndex = world.entityToIndex.get(entityId);
        if (entityIndex) render({ entity: entityIndex });
      }
    }
    if (newValue?.destinationX && newValue?.destinationY) {
      const entityId = ReversePosition.get(
        encodeCoord({ x: newValue.destinationX, y: newValue.destinationY })
      )?.value;

      if (!entityId) return;
      const asteroidType = AsteroidType.get(entityId)?.value;
      if (!asteroidType || asteroidType !== ESpaceRockType.Motherlode) return;

      const entityIndex = world.entityToIndex.get(entityId);
      if (entityIndex) render({ entity: entityIndex });
    }
  });
};
