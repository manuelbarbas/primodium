import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { SPEED_SCALE } from "src/util/constants";

export const useUnclaimedShardAsteroidPoints = (playerEntity: Entity) => {
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
      const canExplode = time >= explodeTime;
      const dripPerSec = canExplode ? 0n : conquestConfigData.shardAsteroidPoints / lifespan;

      let unclaimedPoints = 0n;
      const endTime = time > explodeTime ? explodeTime : time;
      const timeSinceClaimed = endTime - lastConquered;
      unclaimedPoints = dripPerSec * timeSinceClaimed;
      return acc + unclaimedPoints;
    }, 0n);
  }, [conquestConfigData, shardAsteroids, playerEntity, worldSpeed, time]);
};
