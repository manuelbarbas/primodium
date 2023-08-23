import { uuid } from "@latticexyz/utils";
import { GameObjectComponent } from "engine/types";
import { createFxApi } from "src/game/api/fx";

const { outline } = createFxApi();

export const Texture = (
  key: string,
  frame?: string
): GameObjectComponent<"Sprite"> => {
  return {
    id: "texture",
    once: (gameObject) => {
      gameObject.setTexture(key, frame);
    },
  };
};

export const Animation = (key: string): GameObjectComponent<"Sprite"> => {
  return {
    id: "animation",
    once: (gameObject) => {
      gameObject.play(key);
    },
  };
};

export const Outline = (
  options?: Parameters<typeof outline>[1]
): GameObjectComponent<"Sprite"> => {
  return {
    id: uuid(),
    once: (gameObject) => {
      outline(gameObject, options);
    },
  };
};
