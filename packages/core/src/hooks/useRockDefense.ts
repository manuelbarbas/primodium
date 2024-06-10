import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useCore } from "@/hooks/useCore";

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
