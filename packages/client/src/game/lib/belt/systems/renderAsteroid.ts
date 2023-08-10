import { Scene } from "engine/types";
import {
  ObjectPosition,
  SetValue,
} from "../../common/object-components/common";
import { Outline, Texture } from "../../common/object-components/sprite";

export const renderAsteroid = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  //   const gameWorld = namespaceWorld(world, "game");

  //   const query = [Has(HoverTile)];

  const render = () => {
    const asteroidObjectGroup = scene.objectPool.getGroup("asteroid");

    asteroidObjectGroup.add("Sprite").setComponents([
      ObjectPosition({
        x: 0,
        y: 0,
      }),
      SetValue({
        originX: 0.5,
        originY: 0.5,
      }),
      Texture("asteroid-sprite"),
    ]);

    asteroidObjectGroup.add("Sprite").setComponents([
      ObjectPosition({
        x: 10 * tileWidth,
        y: -10 * tileHeight,
      }),
      SetValue({
        originX: 0.5,
        originY: 0.5,
      }),
      Texture("asteroid-sprite"),
      Outline(),
    ]);
  };

  render();
};
