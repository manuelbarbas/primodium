import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { getAsteroidInfo } from "src/util/asteroid";
import { usePrimodium } from "./usePrimodium";

export function useAsteroidInfo(rock: Entity) {
  const { value: blockNumber } = components.BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });
  const primodium = usePrimodium();

  return useMemo(() => {
    return getAsteroidInfo(primodium, rock);
  }, [blockNumber, rock, primodium]);
}
