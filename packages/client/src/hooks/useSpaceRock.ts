import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { BlockNumber } from "src/network/components/clientComponents";
import { getSpaceRockInfo } from "src/util/spacerock";

export function useSpaceRock(rock: Entity) {
  const { value: blockNumber } = BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });

  return useMemo(() => {
    return getSpaceRockInfo(rock);
  }, [blockNumber, rock]);
}
