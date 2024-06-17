import { useGame } from "@/hooks/useGame";
import { InterfaceIcons } from "@primodiumxyz/assets";
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

  const { getWormholeSprite, getPrimaryAsteroidSprite, getSecondaryAsteroidSprite } = game.STARMAP.sprite;
  if (asteroidData.wormhole) return getWormholeSprite();

  const isPrimary = asteroidData.spawnsSecondary;
  if (!isPrimary) {
    const resource = MapEntityLookup[asteroidData.mapId] ?? EntityType.Kimberlite;
    return getSecondaryAsteroidSprite(resource, asteroidData.maxLevel);
  }
  const level = tables.Level.use(asteroid)?.value;
  if (!level) return InterfaceIcons.Asteroid;
  return getPrimaryAsteroidSprite(level);
};
