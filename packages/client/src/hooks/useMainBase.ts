import { useMemo } from "react";
import { decodeCoordEntity } from "src/util/encode";
import { MainBase } from "src/network/components/chainComponents";

export const useMainBaseCoord = () => {
  const mainBase = MainBase.use()?.value;
  const coord = useMemo(() => {
    return mainBase ? decodeCoordEntity(mainBase) : undefined;
  }, [mainBase]);

  return coord;
};
