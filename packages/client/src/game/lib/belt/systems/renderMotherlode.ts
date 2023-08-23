import { Scene } from "engine/types";
import {
  namespaceWorld,
  Has,
  defineEnterSystem,
  EntityIndex,
  HasValue,
} from "@latticexyz/recs";
import {
  ObjectPosition,
  SetValue,
  onClick,
} from "../../common/object-components/common";
import { Texture } from "../../common/object-components/sprite";
import {
  AsteroidType,
  Motherlode,
  Position,
} from "src/network/components/chainComponents";
import { world } from "src/network/world";
import {
  EMotherlodeSize,
  ESpaceRockType,
  MotherlodeSizeNames,
  MotherlodeTypeNames,
} from "../types";
import { ActiveAsteroid } from "src/network/components/clientComponents";

export const renderMotherlode = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const query = [
    Has(AsteroidType),
    HasValue(AsteroidType, { value: ESpaceRockType.Motherlode }),
  ];

  const render = ({ entity }: { entity: EntityIndex }) => {
    const entityId = world.entities[entity];
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
      SetValue({
        originX: 0.5,
        originY: 0.5,
        scale,
      }),
      Texture(sprite),
    ]);
  };

  defineEnterSystem(gameWorld, query, render);
};
