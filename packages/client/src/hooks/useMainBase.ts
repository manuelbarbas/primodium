import { decodeCoordEntity } from "src/util/encode";
import { MainBase } from "src/network/components/chainComponents";
import { useAccount } from "./useAccount";
import { useMemo } from "react";

export const useMainBaseCoord = () => {
  const { address } = useAccount();
  const mainBase = MainBase.use(address)?.value;
  const coord = useMemo(
    () => (mainBase ? decodeCoordEntity(mainBase) : undefined),
    [mainBase, address]
  );

  return coord;
};
