import { bigIntMax } from "@latticexyz/common/utils";
import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { SPEED_SCALE } from "@/lib/constants";
import { useMud } from "@/hooks/useMud";

export const usePlayerUnclaimedShardAsteroidPoints = (playerEntity: Entity) => {
  const { components } = useMud();
  const conquestConfigData = components.P_ConquestConfig.use();
  const worldSpeed = components.P_GameConfig.use()?.worldSpeed ?? 100n;
  const time = components.Time.use()?.value ?? 0n;
  const shardAsteroids = components.ShardAsteroid.useAll();

  return useMemo(() => {
    if (!conquestConfigData) return 0n;
    return shardAsteroids.reduce((acc, asteroidEntity) => {
      const owner = components.OwnedBy.get(asteroidEntity)?.value;
      if (!owner || owner !== playerEntity) return acc;
      const shardAsteroid = components.ShardAsteroid.get(asteroidEntity)!;
      const lastConquered = components.LastConquered.get(asteroidEntity)?.value ?? 0n;
      const lifespan = (conquestConfigData.shardAsteroidLifeSpan * SPEED_SCALE) / worldSpeed;

      const explodeTime = shardAsteroid.spawnTime + lifespan;

      let unclaimedPoints = 0n;
      const endTime = time > explodeTime ? explodeTime : time;
      const timeSinceClaimed = bigIntMax(0n, endTime - lastConquered);
      const holdPct = (timeSinceClaimed * 100000n) / lifespan;

      unclaimedPoints = (holdPct * conquestConfigData.shardAsteroidPoints) / 100000n;
      return acc + unclaimedPoints;
    }, 0n);
  }, [conquestConfigData, shardAsteroids, playerEntity, worldSpeed, time]);
};

export const useAllUnclaimedShardAsteroidPts = () => {
  const { components } = useMud();
  const conquestConfigData = components.P_ConquestConfig.use();
  const worldSpeed = components.P_GameConfig.use()?.worldSpeed ?? 100n;
  const time = components.Time.use()?.value ?? 0n;
  const shardAsteroids = components.ShardAsteroid.useAll();
  return useMemo(() => {
    if (!conquestConfigData) return new Map<Entity, bigint>();
    return shardAsteroids.reduce((acc, asteroidEntity) => {
      const owner = components.OwnedBy.get(asteroidEntity)?.value as Entity;
      if (!owner) return acc;
      const shardAsteroid = components.ShardAsteroid.get(asteroidEntity)!;
      const lastConquered = components.LastConquered.get(asteroidEntity)?.value ?? 0n;
      const lifespan = (conquestConfigData.shardAsteroidLifeSpan * SPEED_SCALE) / worldSpeed;

      const explodeTime = shardAsteroid.spawnTime + lifespan;

      let unclaimedPoints = 0n;
      const endTime = time > explodeTime ? explodeTime : time;
      const timeSinceClaimed = bigIntMax(0n, endTime - lastConquered);
      const holdPct = (timeSinceClaimed * 100000n) / lifespan;

      unclaimedPoints = (holdPct * conquestConfigData.shardAsteroidPoints) / 100000n;
      const prevUnclaimedPoints = acc.get(owner) ?? 0n;
      acc.set(owner, prevUnclaimedPoints + unclaimedPoints);
      return acc;
    }, new Map<Entity, bigint>());
  }, [conquestConfigData, shardAsteroids, worldSpeed, time]);
};
