import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useMud } from "@/hooks/useMud";

export const useBuildingInfo = (building: Entity) => {
  const {
    components,
    utils: { getBuildingInfo },
  } = useMud();
  const buildingLevel = components.Level.use(building)?.value;

  return useMemo(() => getBuildingInfo(building), [building, buildingLevel]);
};
