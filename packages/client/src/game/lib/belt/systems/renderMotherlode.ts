import { Scene } from "engine/types";
import {
  namespaceWorld,
  Has,
  defineEnterSystem,
  // defineUpdateQuery,
  EntityIndex,
} from "@latticexyz/recs";
import {
  ObjectPosition,
  SetValue,
} from "../../common/object-components/common";
import { Texture } from "../../common/object-components/sprite";
import { AsteroidType } from "src/network/components/chainComponents";
import { world } from "src/network/world";

export const renderMotherlode = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const query = [Has(AsteroidType)];

  const render = ({ entity }: { entity: EntityIndex }) => {
    const motherlodeObjectGroup = scene.objectPool.getGroup(
      "motherlode_" + entity
    );
    const coord = { x: 0, y: 0, parent: 0 };

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
