import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { getBuildingName } from "src/util/building";

export const useBuildingName = (building: Entity | undefined) => {
  return useMemo(() => {
    if (!building) return null;
    getBuildingName(building);
  }, [building]);
};
