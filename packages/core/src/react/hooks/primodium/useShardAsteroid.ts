import { bigIntMax } from "@latticexyz/common/utils";
import { useMemo } from "react";

import { Entity } from "@primodiumxyz/reactive-tables";
import { EntityType, SPEED_SCALE } from "@/lib/constants";
import { useCore } from "@/react";
import { useResourceCount } from "@/react/hooks/useResourceCount";

/**
 * Custom hook that retrieves data related to a shard asteroid for a given entity.
 *
 * @param entity - The entity for which to retrieve the shard asteroid data.
 * @returns An object containing various properties related to the shard asteroid, or `null` if the data is not
 *   available.
 */
export const useShardAsteroid = (entity: Entity) => {
  const {
    tables,
    utils: { getShardData },
  } = useCore();
  const conquestConfigData = tables.P_ConquestConfig.use();
  const shardAsteroid = tables.ShardAsteroid.use(entity);
  const worldSpeed = tables.P_GameConfig.use()?.worldSpeed ?? 100n;
  const time = tables.Time.use()?.value ?? 0n;
  const owner = tables.OwnedBy.use(entity)?.value;
  const player = tables.Account.use()?.value;
  const lastConquered = tables.LastConquered.use(entity)?.value ?? 0n;
  const { resourceCount: encryption, resourceStorage: maxEncryption } = useResourceCount(EntityType.Encryption, entity);

  const shardName = getShardData(entity);
  const isGameOver = tables.VictoryStatus.use()?.gameOver ?? false;

  const timeData = useMemo(() => {
    if (!conquestConfigData || !shardAsteroid) return null;
    const lifespan = (conquestConfigData.shardAsteroidLifeSpan * SPEED_SCALE) / worldSpeed;

    const explodeTime = shardAsteroid.spawnTime + lifespan;
    const canExplode = time >= explodeTime;
    const timeUntilExplode = canExplode ? 0n : Number(explodeTime - time);

    const shardAsteroidPoints = isGameOver ? 0n : conquestConfigData.shardAsteroidPoints;
    const dripPerSec = shardAsteroidPoints / lifespan;

    let unclaimedPoints = 0n;
    if (!!owner && owner === player) {
      const endTime = time > explodeTime ? explodeTime : time;
      const timeSinceClaimed = bigIntMax(0n, endTime - lastConquered);
      const holdPct = (timeSinceClaimed * 100000n) / lifespan;
      unclaimedPoints = (holdPct * shardAsteroidPoints) / 100000n;
    }

    return {
      distance: shardAsteroid.distanceFromCenter,
      name: shardName?.name,
      description: shardName?.description,
      points: conquestConfigData.shardAsteroidPoints,
      lifespan,
      regen: conquestConfigData.shardAsteroidEncryptionRegen,
      spawnTime: shardAsteroid.spawnTime,
      explodeTime,
      timeUntilExplode,
      canExplode,
      owner,
      dripPerSec,
      unclaimedPoints,
      explodePoints: shardAsteroidPoints,
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
