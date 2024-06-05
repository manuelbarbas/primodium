import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useCore } from "@/hooks/useCore";

export const useBuildingInfo = (building: Entity) => {
  const {
    components,
    utils: { getBuildingInfo },
  } = useCore();
  const buildingLevel = components.Level.use(building)?.value;

  return useMemo(() => getBuildingInfo(building), [building, buildingLevel]);
};
