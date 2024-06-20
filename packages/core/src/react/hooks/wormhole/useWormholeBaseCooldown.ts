import { Entity } from "@primodiumxyz/reactive-tables";
import { useMemo } from "react";
import { useCore } from "@/react/hooks/useCore";

/**
 * Calculates cooldown status and remaining time for a wormhole base entity.
 *
 * @param wormholeBaseEntity - The wormhole base entity.
 * @returns An object containing the cooldown status, cooldown end time, and remaining time.
 */
export const useWormholeBaseCooldown = (
  wormholeBaseEntity: Entity
): { inCooldown: boolean; cooldownEnd: bigint; timeLeft: bigint } => {
  const { tables } = useCore();
  const time = tables.Time.use()?.value ?? 0n;
  const cooldownEnd = tables.CooldownEnd.use(wormholeBaseEntity)?.value ?? 0n;
  return useMemo(
    () => ({ inCooldown: time < cooldownEnd, cooldownEnd, timeLeft: cooldownEnd > time ? cooldownEnd - time : 0n }),
    [time, cooldownEnd]
  );
};
