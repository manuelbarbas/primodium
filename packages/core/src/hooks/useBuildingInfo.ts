import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useCore } from "@/hooks/useCore";

export const useBuildingInfo = (building: Entity) => {
  const {
    tables,
    utils: { getBuildingInfo },
  } = useCore();
  const buildingLevel = tables.Level.use(building)?.value;

  return useMemo(() => getBuildingInfo(building), [building, buildingLevel]);
};
