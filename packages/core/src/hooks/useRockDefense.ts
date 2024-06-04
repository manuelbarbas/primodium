import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useMud } from "@/hooks/useMud";

export function useRockDefense(rock: Entity) {
  const {
    components,
    utils: { getRockDefense },
  } = useMud();

  const { value: blockNumber } = components.BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });

  return useMemo(() => {
    return getRockDefense(rock);
  }, [blockNumber, rock]);
}
