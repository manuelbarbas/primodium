import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { SPEED_SCALE } from "src/util/constants";

export const useClaimConquestTime = (asteroidEntity: Entity) => {
  const owner = components.OwnedBy.use(asteroidEntity)?.value as Entity | undefined;
  const lastConquered = components.LastConquered.use(asteroidEntity)?.value ?? 0n;
  const time = components.Time.use()?.value ?? 0n;
  const conquestConfig = components.P_ConquestConfig.use();
  const gameConfig = components.P_GameConfig.use();

  return useMemo(() => {
    if (!owner || !conquestConfig || !gameConfig) return null;
    const holdTime = (conquestConfig.holdTime * SPEED_SCALE) / gameConfig.worldSpeed;
    const timeUntilClaim = lastConquered + holdTime - time;
    return { canConquer: timeUntilClaim <= 0n, timeUntilClaim };
  }, [conquestConfig, gameConfig, lastConquered, owner, time]);
};
