import { useMud } from "@/hooks/useMud";
import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";

export const useBuildingName = (building: Entity | undefined) => {
  const {
    utils: { getBuildingName },
  } = useMud();

  return useMemo(() => {
    if (!building) return null;
    getBuildingName(building);
  }, [building]);
};
