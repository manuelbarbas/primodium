import { Scene } from "engine/types";
import {
  namespaceWorld,
  Has,
  defineEnterSystem,
  // defineUpdateQuery,
  EntityIndex,
  HasValue,
} from "@latticexyz/recs";
import {
  ObjectPosition,
  SetValue,
} from "../../common/object-components/common";
import { Texture } from "../../common/object-components/sprite";
import { AsteroidType, Position } from "src/network/components/chainComponents";
import { world } from "src/network/world";
import { ESpaceRockType } from "../types";

export const renderMotherlode = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const query = [
    Has(AsteroidType),
    HasValue(AsteroidType, { value: ESpaceRockType.Motherlode }),
  ];

  const render = ({ entity }: { entity: EntityIndex }) => {
    const motherlodeObjectGroup = scene.objectPool.getGroup(
      "motherlode_" + entity
    );
    const coord = Position.get(world.entities[entity]);
    if (!coord) return;

    motherlodeObjectGroup.add("Sprite").setComponents([
      ObjectPosition({
        x: coord.x * tileWidth,
        y: -coord.y * tileHeight,
      }),
      SetValue({
        originX: 0.5,
        originY: 0.5,
      }),
      Texture("motherlode-sprite"),
    ]);
  };

  defineEnterSystem(gameWorld, query, render);
};
