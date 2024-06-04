import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { SPEED_SCALE } from "@/lib/constants";
import { useMud } from "@/hooks";

export const useClaimPrimodium = (asteroidEntity: Entity) => {
  const { components } = useMud();
  const points = components.Asteroid.use(asteroidEntity)?.primodium ?? 0n;
  const owner = components.OwnedBy.use(asteroidEntity)?.value as Entity | undefined;
  const lastConquered = components.LastConquered.use(asteroidEntity)?.value ?? 0n;
  const time = components.Time.use()?.value ?? 0n;
  const conquestConfig = components.P_ConquestConfig.use();
  const gameConfig = components.P_GameConfig.use();

  return useMemo(() => {
    if (points === 0n || !owner || !conquestConfig || !gameConfig) return null;
    const holdTime = (conquestConfig.holdTime * SPEED_SCALE) / gameConfig.worldSpeed;
    const timeUntilClaim = lastConquered + holdTime - time;
    return { canConquer: timeUntilClaim <= 0n, timeUntilClaim, points };
  }, [conquestConfig, gameConfig, lastConquered, owner, points, time]);
};
