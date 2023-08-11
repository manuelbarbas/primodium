import { useEffect } from "react";
import { useAccount } from "./useAccount";
import { useMud } from "./useMud";
import { setupActiveAsteroid } from "src/network/systems/setupActiveAsteroid";
import { BlockNumber } from "src/network/components/clientComponents";

export const useInit = () => {
  const { world, blockNumber$ } = useMud();
  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      setupActiveAsteroid(address);
    }

    const blockListener = blockNumber$.subscribe((blockNumber) => {
      BlockNumber.set({ value: blockNumber });
    });

    return () => {
      world.registerDisposer(() => blockListener.unsubscribe());
    };
  }, [address]);
};
