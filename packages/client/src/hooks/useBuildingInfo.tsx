import { EntityID } from "@latticexyz/recs";
import { useMemo } from "react";
import { Level } from "src/network/components/chainComponents";
import { getBuildingInfo } from "src/util/building";

export const useBuildingInfo = (building: EntityID) => {
  const buildingLevel = Level.use(building);

  return useMemo(() => getBuildingInfo(building), [building, buildingLevel]);
};
