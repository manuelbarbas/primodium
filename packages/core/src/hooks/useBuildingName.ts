import { useCore } from "@/hooks/useCore";
import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";

export const useBuildingName = (building: Entity | undefined) => {
  const {
    utils: { getBuildingName },
  } = useCore();

  return useMemo(() => {
    if (!building) return null;
    getBuildingName(building);
  }, [building]);
};
