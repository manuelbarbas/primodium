import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { BlockNumber } from "src/network/components/clientComponents";
import { getRockDefense } from "src/util/defense";

export function useRockDefense(rock: Entity, playerEntity: Entity) {
  const { value: blockNumber } = BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });

  return useMemo(() => {
    return getRockDefense(rock, playerEntity);
  }, [blockNumber, rock, playerEntity]);
}
