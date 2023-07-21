import { useMemo } from "react";
import { decodeCoordEntity } from "src/util/encode";
import { MainBase } from "src/network/components/chainComponents";
import { useComponentValue } from "./useComponentValue";

export const useMainBaseCoord = () => {
  const mainBase = useComponentValue(MainBase)?.value;
  const coord = useMemo(() => {
    return mainBase ? decodeCoordEntity(mainBase) : undefined;
  }, [mainBase]);

  return coord;
};
