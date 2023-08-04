import { GameObjectComponent } from "engine/types";
import { createFxApi } from "src/game/api/fx";

const { outline } = createFxApi();

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

export const SpriteOutline = (
  options?: Parameters<typeof outline>[1]
): GameObjectComponent<"Sprite"> => {
  return {
    id: "outline",
    once: (gameObject) => {
      outline(gameObject, options);
    },
  };
};
