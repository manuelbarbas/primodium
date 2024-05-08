import { useGame } from "@/hooks/useGame";
import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { getAsteroidInfo } from "src/util/asteroid";

export function useAsteroidInfo(rock: Entity) {
  const { value: blockNumber } = components.BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });
  const game = useGame();

  return useMemo(() => {
    return getAsteroidInfo(game, rock);
  }, [blockNumber, rock, game]);
}
