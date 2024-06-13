import { getPrimarySprite, getSecondarySprite } from "@/game/lib/objects/Asteroid/helpers";
import { useGame } from "@/hooks/useGame";
import { InterfaceIcons, Sprites } from "@primodiumxyz/assets";
import { EntityType, MapEntityLookup } from "@primodiumxyz/core";
import { useCore } from "@primodiumxyz/core/react";
import { Entity } from "@primodiumxyz/reactive-tables";

export const useAsteroidImage = (asteroid: Entity): string => {
  const { tables } = useCore();
  const game = useGame();
  const isShard = tables.ShardAsteroid.has(asteroid);
  if (isShard) {
    return InterfaceIcons.Shard;
  }

  const asteroidData = tables.Asteroid.use(asteroid);
  if (!asteroidData) return InterfaceIcons.NotAllowed;

  const { getSpriteBase64 } = game.ASTEROID.sprite;
  if (asteroidData.wormhole) return getSpriteBase64(Sprites.WormholeAsteroid);

  const isPrimary = asteroidData.spawnsSecondary;
  if (!isPrimary) {
    const resource = MapEntityLookup[asteroidData.mapId] ?? EntityType.Kimberlite;
    const sprite = getSecondarySprite(resource, asteroidData.maxLevel);
    return getSpriteBase64(sprite);
  }
  const level = tables.Level.use(asteroid)?.value;
  if (!level) return InterfaceIcons.Asteroid;
  return getSpriteBase64(getPrimarySprite(level));
};
