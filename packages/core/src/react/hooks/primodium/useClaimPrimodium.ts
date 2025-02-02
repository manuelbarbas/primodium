import { useMemo } from "react";

import { Entity } from "@primodiumxyz/reactive-tables";
import { SPEED_SCALE } from "@/lib/constants";
import { useCore } from "@/react";

/**
 * Custom hook that calculates the time until an asteroid can be claimed in the Primodium game.
 *
 * @param asteroidEntity - The entity representing the asteroid.
 * @returns An object containing information about the claim status and time until claim.
 */
export const useClaimPrimodium = (asteroidEntity: Entity) => {
  const { tables } = useCore();
  const points = tables.Asteroid.use(asteroidEntity)?.primodium ?? 0n;
  const owner = tables.OwnedBy.use(asteroidEntity)?.value as Entity | undefined;
  const lastConquered = tables.LastConquered.use(asteroidEntity)?.value ?? 0n;
  const time = tables.Time.use()?.value ?? 0n;
  const conquestConfig = tables.P_ConquestConfig.use();
  const gameConfig = tables.P_GameConfig.use();
  const gameOver = tables.VictoryStatus.use()?.gameOver ?? false;

  return useMemo(() => {
    if (gameOver) return null;
    if (points === 0n || !owner || !conquestConfig || !gameConfig) return null;
    const holdTime = (conquestConfig.holdTime * SPEED_SCALE) / gameConfig.worldSpeed;
    const timeUntilClaim = lastConquered + holdTime - time;
    return { canConquer: timeUntilClaim <= 0n, timeUntilClaim, points };
  }, [gameOver, conquestConfig, gameConfig, lastConquered, owner, points, time]);
};
