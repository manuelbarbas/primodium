import { bigIntMax } from "@latticexyz/common/utils";
import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useFullResourceCount } from "../useFullResourceCount";
import { EntityType, SPEED_SCALE } from "@/util/constants";
import { components } from "@/network/components";
import { entityToShardData } from "@/util/name";

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

  const shardNameData = entityToShardData(entity);
  const isGameOver = components.VictoryStatus.use()?.gameOver ?? false;

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
      name: shardNameData?.name,
      description: shardNameData?.description,
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
