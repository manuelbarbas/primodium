import { GameObjectComponent } from "engine/types";
import { createFxApi } from "src/game/api/fx";

const { outline, removeOutline } = createFxApi();

export const Texture = (key: string, frame?: string): GameObjectComponent<"Sprite"> => {
  return {
    id: "texture",
    once: (gameObject) => {
      gameObject.setTexture(key, frame);
    },
  };
};

export const Animation = (key: string, stop?: boolean): GameObjectComponent<"Sprite"> => {
  return {
    id: "animation",
    once: (gameObject) => {
      stop ? gameObject.stop() : gameObject.play(key);
    },
  };
};

export const Outline = (options?: Parameters<typeof outline>[1]): GameObjectComponent<"Sprite"> => {
  return {
    id: "outline",
    once: (gameObject) => {
      outline(gameObject, options);
    },
    exit: (gameObject) => {
      removeOutline(gameObject);
    },
  };
};
