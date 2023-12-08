import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { getBuildingInfo } from "src/util/building";

export const useBuildingInfo = (building: Entity) => {
  const buildingLevel = components.Level.use(building)?.value;

  return useMemo(() => getBuildingInfo(building), [building, buildingLevel]);
};
