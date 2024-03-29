import { Scene } from "engine/types";
import { SpriteKeys } from "../lib/constants/assets/sprites";
import { Assets } from "../lib/constants/assets";

const cache = new Map<SpriteKeys, string>();

export const createSpriteApi = (scene: Scene) => {
  function getSpriteBase64(spriteKey: SpriteKeys, atlasKey = Assets.SpriteAtlas) {
    if (!cache.has(spriteKey)) {
      const texture = scene.phaserScene.textures.getBase64(atlasKey, spriteKey);
      cache.set(spriteKey, texture);
      return texture;
    }

    return cache.get(spriteKey) ?? "";
  }

  return { getSpriteBase64 };
};
