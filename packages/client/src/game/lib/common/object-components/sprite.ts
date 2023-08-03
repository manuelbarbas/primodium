import { Coord } from "@latticexyz/utils";
import { GameObjectComponent } from "engine/types";
import { createFxApi } from "src/game/api/fx";

const { outline } = createFxApi();

export const SpritePosition = (coord: Coord): GameObjectComponent<"Sprite"> => {
  return {
    id: "position",
    once: (gameObject) => {
      gameObject.x = coord.x;
      gameObject.y = coord.y;
    },
  };
};

export const SpriteTexture = (
  key: string,
  frame: string
): GameObjectComponent<"Sprite"> => {
  return {
    id: "texture",
    once: (gameObject) => {
      gameObject.setTexture(key, frame);
    },
  };
};

export const SpriteAnimation = (key: string): GameObjectComponent<"Sprite"> => {
  return {
    id: "animation",
    once: (gameObject) => {
      gameObject.play(key);
    },
  };
};

export const SpriteOutline = (): GameObjectComponent<"Sprite"> => {
  return {
    id: "outline",
    once: (gameObject) => {
      outline(gameObject);
    },
  };
};
