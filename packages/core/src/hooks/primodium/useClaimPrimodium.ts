import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { SPEED_SCALE } from "@/lib/constants";
import { useCore } from "@/hooks";

export const useClaimPrimodium = (asteroidEntity: Entity) => {
  const { tables } = useCore();
  const points = tables.Asteroid.use(asteroidEntity)?.primodium ?? 0n;
  const owner = tables.OwnedBy.use(asteroidEntity)?.value as Entity | undefined;
  const lastConquered = tables.LastConquered.use(asteroidEntity)?.value ?? 0n;
  const time = tables.Time.use()?.value ?? 0n;
  const conquestConfig = tables.P_ConquestConfig.use();
  const gameConfig = tables.P_GameConfig.use();

  return useMemo(() => {
    if (points === 0n || !owner || !conquestConfig || !gameConfig) return null;
    const holdTime = (conquestConfig.holdTime * SPEED_SCALE) / gameConfig.worldSpeed;
    const timeUntilClaim = lastConquered + holdTime - time;
    return { canConquer: timeUntilClaim <= 0n, timeUntilClaim, points };
  }, [conquestConfig, gameConfig, lastConquered, owner, points, time]);
};
