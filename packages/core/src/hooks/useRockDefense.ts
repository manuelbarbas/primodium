import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useCore } from "@/hooks/useCore";

/**
 * Calculates the defense value of a rock entity.
 *
 * @param rock - The rock entity for which to calculate the defense value.
 * @returns The defense value of the rock entity.
 */
export function useRockDefense(rock: Entity) {
  const {
    tables,
    utils: { getRockDefense },
  } = useCore();

  const { value: blockNumber } = tables.BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });

  return useMemo(() => {
    return getRockDefense(rock);
  }, [blockNumber, rock]);
}
