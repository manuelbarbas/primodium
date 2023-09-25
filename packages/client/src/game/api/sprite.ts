import { Assets, SpriteKeys } from "@game/constants";
import { Scene } from "engine/types";

export const createSpriteApi = (scene: Scene) => {
  function getSpriteBase64(
    spriteKey: SpriteKeys,
    atlasKey = Assets.SpriteAtlas
  ) {
    return scene.phaserScene.textures.getBase64(atlasKey, spriteKey);
  }

  return { getSpriteBase64 };
};
