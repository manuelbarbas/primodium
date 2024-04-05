import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { EntityType, SPEED_SCALE } from "src/util/constants";
import { useFullResourceCount } from "../useFullResourceCount";

export const useShardAsteroid = (entity: Entity) => {
  const conquestConfigData = components.P_ConquestConfig.use();
  const shardAsteroid = components.ShardAsteroid.use(entity);
  const worldSpeed = components.P_GameConfig.use()?.worldSpeed ?? 100n;
  const time = components.Time.use()?.value ?? 0n;
  const owner = components.OwnedBy.use(entity)?.value;
  const player = components.Account.use()?.value;
  const lastConquered = components.LastConquered.use(entity)?.value ?? 0n;
  const { resourceCount: encryption, resourceStorage: maxEncryption } = useFullResourceCount(
    EntityType.Encryption,
    entity
  );

  const timeData = useMemo(() => {
    if (!conquestConfigData || !shardAsteroid) return null;
    const lifespan = (conquestConfigData.shardAsteroidLifeSpan * SPEED_SCALE) / worldSpeed;

    const explodeTime = shardAsteroid.spawnTime + lifespan;
    const canExplode = time >= explodeTime;
    const timeUntilExplode = canExplode ? 0n : Number(explodeTime - time);
    const dripPerSec = canExplode ? 0n : conquestConfigData.shardAsteroidPoints / lifespan;

    let unclaimedPoints = 0n;
    if (!!owner && owner === player) {
      const endTime = time > explodeTime ? explodeTime : time;
      const timeSinceClaimed = endTime - lastConquered;
      unclaimedPoints = dripPerSec * timeSinceClaimed + (canExplode ? conquestConfigData.shardAsteroidPoints : 0n);
    }

    return {
      distance: shardAsteroid.distanceFromCenter,
      points: conquestConfigData.shardAsteroidPoints,
      lifespan,
      regen: conquestConfigData.shardAsteroidEncryptionRegen,
      spawnTime: shardAsteroid.spawnTime,
      explodeTime,
      timeUntilExplode,
      canExplode,
      dripPerSec,
      unclaimedPoints,
    };
  }, [conquestConfigData, shardAsteroid, worldSpeed, time, owner, player, lastConquered]);

  if (!timeData) return null;
  return {
    ...timeData,
    encryption,
    maxEncryption,
    lastConquered,
  };
};
