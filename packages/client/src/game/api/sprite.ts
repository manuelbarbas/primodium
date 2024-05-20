import { Scene } from "engine/types";
import { Sprites, Assets } from "@primodiumxyz/assets";

const cache = new Map<Sprites, string>();

export const createSpriteApi = (scene: Scene) => {
  function getSpriteBase64(spriteKey: Sprites, atlasKey = Assets.SpriteAtlas) {
    if (!cache.has(spriteKey)) {
      const texture = scene.phaserScene.textures.getBase64(atlasKey, spriteKey);
      cache.set(spriteKey, texture);
      return texture;
    }

    return cache.get(spriteKey) ?? "";
  }

  return { getSpriteBase64 };
};
