import { bigIntMax } from "@latticexyz/common/utils";
import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { SPEED_SCALE } from "src/util/constants";

export const usePlayerUnclaimedConquestAsteroidPts = (playerEntity: Entity) => {
  const conquestConfigData = components.P_ConquestConfig.use();
  const worldSpeed = components.P_GameConfig.use()?.worldSpeed ?? 100n;
  const time = components.Time.use()?.value ?? 0n;
  const conquestAsteroids = components.ConquestAsteroid.useAll();

  return useMemo(() => {
    if (!conquestConfigData) return 0n;
    return conquestAsteroids.reduce((acc, asteroidEntity) => {
      const owner = components.OwnedBy.get(asteroidEntity)?.value;
      if (!owner || owner !== playerEntity) return acc;
      const conquestAsteroid = components.ConquestAsteroid.get(asteroidEntity)!;
      const lastConquered = components.LastConquered.get(asteroidEntity)?.value ?? 0n;
      const lifespan = (conquestConfigData.conquestAsteroidLifeSpan * SPEED_SCALE) / worldSpeed;

      const explodeTime = conquestAsteroid.spawnTime + lifespan;

      let unclaimedPoints = 0n;
      const endTime = time > explodeTime ? explodeTime : time;
      const timeSinceClaimed = bigIntMax(0n, endTime - lastConquered);
      const holdPct = (timeSinceClaimed * 100000n) / lifespan;

      unclaimedPoints = (holdPct * conquestConfigData.conquestAsteroidPoints) / 100000n;
      return acc + unclaimedPoints;
    }, 0n);
  }, [conquestConfigData, conquestAsteroids, playerEntity, worldSpeed, time]);
};

export const useAllUnclaimedConquestAsteroidPts = () => {
  const conquestConfigData = components.P_ConquestConfig.use();
  const worldSpeed = components.P_GameConfig.use()?.worldSpeed ?? 100n;
  const time = components.Time.use()?.value ?? 0n;
  const conquestAsteroids = components.ConquestAsteroid.useAll();
  return useMemo(() => {
    if (!conquestConfigData) return new Map<Entity, bigint>();
    return conquestAsteroids.reduce((acc, asteroidEntity) => {
      const owner = components.OwnedBy.get(asteroidEntity)?.value as Entity;
      if (!owner) return acc;
      const conquestAsteroid = components.ConquestAsteroid.get(asteroidEntity)!;
      const lastConquered = components.LastConquered.get(asteroidEntity)?.value ?? 0n;
      const lifespan = (conquestConfigData.conquestAsteroidLifeSpan * SPEED_SCALE) / worldSpeed;

      const explodeTime = conquestAsteroid.spawnTime + lifespan;

      let unclaimedPoints = 0n;
      const endTime = time > explodeTime ? explodeTime : time;
      const timeSinceClaimed = bigIntMax(0n, endTime - lastConquered);
      const holdPct = (timeSinceClaimed * 100000n) / lifespan;

      unclaimedPoints = (holdPct * conquestConfigData.conquestAsteroidPoints) / 100000n;
      const prevUnclaimedPoints = acc.get(owner) ?? 0n;
      acc.set(owner, prevUnclaimedPoints + unclaimedPoints);
      return acc;
    }, new Map<Entity, bigint>());
  }, [conquestConfigData, conquestAsteroids, worldSpeed, time]);
};

export const getAllUnclaimedConquestAsteroidPts = () => {
  const conquestConfigData = components.P_ConquestConfig.get();
  const worldSpeed = components.P_GameConfig.get()?.worldSpeed ?? 100n;
  const time = components.Time.get()?.value ?? 0n;
  const conquestAsteroids = components.ConquestAsteroid.useAll();
  if (!conquestConfigData) return new Map<Entity, bigint>();
  return conquestAsteroids.reduce((acc, asteroidEntity) => {
    const owner = components.OwnedBy.get(asteroidEntity)?.value as Entity;
    if (!owner) return acc;
    const conquestAsteroid = components.ConquestAsteroid.get(asteroidEntity)!;
    const lastConquered = components.LastConquered.get(asteroidEntity)?.value ?? 0n;
    const lifespan = (conquestConfigData.conquestAsteroidLifeSpan * SPEED_SCALE) / worldSpeed;

    const explodeTime = conquestAsteroid.spawnTime + lifespan;

    let unclaimedPoints = 0n;
    const endTime = time > explodeTime ? explodeTime : time;
    const timeSinceClaimed = bigIntMax(0n, endTime - lastConquered);
    const holdPct = (timeSinceClaimed * 100000n) / lifespan;

    unclaimedPoints = (holdPct * conquestConfigData.conquestAsteroidPoints) / 100000n;
    const prevUnclaimedPoints = acc.get(owner) ?? 0n;
    acc.set(owner, prevUnclaimedPoints + unclaimedPoints);
    return acc;
  }, new Map<Entity, bigint>());
};
