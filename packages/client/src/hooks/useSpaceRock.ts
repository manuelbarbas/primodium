import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { BlockNumber } from "src/network/components/clientComponents";
import { getAsteroidInfo } from "src/util/asteroid";
import { usePrimodium } from "./usePrimodium";

export function useSpaceRock(rock: Entity) {
  const { value: blockNumber } = BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });
  const primodium = usePrimodium();

  return useMemo(() => {
    return getAsteroidInfo(primodium, rock);
  }, [blockNumber, rock, primodium]);
}
