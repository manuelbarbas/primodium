import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { useFullResourceCount } from "./useFullResourceCount";

export const useConquestAsteroid = (entity: Entity) => {
  const conquestConfigData = components.P_ConquestConfig.use();
  const conquestAsteroid = components.ConquestAsteroid.use(entity);
  const time = components.Time.use()?.value ?? 0n;
  const { resourceCount: encryption, resourceStorage: maxEncryption } = useFullResourceCount(
    EntityType.Encryption,
    entity
  );
  return useMemo(() => {
    if (!conquestConfigData || !conquestAsteroid) return null;
    const explodeTime = conquestAsteroid.spawnTime + conquestConfigData.conquestAsteroidLifeSpan;
    const canExplode = time >= explodeTime;
    const timeUntilExplode = canExplode ? 0 : Number(explodeTime - time);
    return {
      distance: conquestAsteroid.distanceFromCenter,
      points: conquestConfigData.conquestAsteroidPoints,
      lifespan: conquestConfigData.conquestAsteroidLifeSpan,
      regen: conquestConfigData.conquestAsteroidEncryptionRegen,
      spawnTime: conquestAsteroid.spawnTime,
      explodeTime,
      timeUntilExplode,
      canExplode,
      encryption,
      maxEncryption,
    };
  }, [conquestConfigData, conquestAsteroid, time, encryption, maxEncryption]);
};
