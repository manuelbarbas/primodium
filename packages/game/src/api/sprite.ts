import { Scene } from "@primodiumxyz/engine/types";
import { Sprites, Assets } from "@primodiumxyz/assets";
import { getPrimarySprite, getSecondarySprite } from "@game/lib/objects/asteroid/helpers";
import { Entity } from "@primodiumxyz/reactive-tables";
import { EntityTypetoBuildingSprites, MainbaseLevelToEmblem } from "@game/lib/mappings";
import { clampedIndex } from "@primodiumxyz/core";

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

  function getPrimaryAsteroidSprite(level: bigint) {
    return getSpriteBase64(getPrimarySprite(level));
  }

  function getSecondaryAsteroidSprite(resource: Entity, maxLevel: bigint) {
    return getSpriteBase64(getSecondarySprite(resource, maxLevel));
  }

  function getWormholeSprite() {
    return getSpriteBase64(Sprites.WormholeAsteroid);
  }

  function getBuildingSprite(buildingType: Entity, level: bigint) {
    const buildingSprites = EntityTypetoBuildingSprites[buildingType];
    if (!buildingSprites) return "";

    const imageIndex = parseInt(level ? level.toString() : "1") - 1;
    return getSpriteBase64(buildingSprites[clampedIndex(imageIndex, buildingSprites.length)] ?? Sprites.EMPTY);
  }

  function getEmblemSprite(level: bigint) {
    return getSpriteBase64(
      MainbaseLevelToEmblem[clampedIndex(Number(level - 1n), MainbaseLevelToEmblem.length)] ?? Sprites.Emblem1
    );
  }

  return {
    getSpriteBase64,
    getPrimaryAsteroidSprite,
    getSecondaryAsteroidSprite,
    getWormholeSprite,
    getBuildingSprite,
    getEmblemSprite,
  };
};
