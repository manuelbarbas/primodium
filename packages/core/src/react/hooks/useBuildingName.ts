import { Entity } from "@primodiumxyz/reactive-tables";
import { useCore } from "@/react/hooks/useCore";
import { useMemo } from "react";

/**
 * Gets the name of a building.
 *
 * @param building - The building entity.
 * @returns The name of the building, or null if the building is undefined.
 */
export const useBuildingName = (building: Entity | undefined) => {
  const {
    utils: { getBuildingName },
  } = useCore();

  return useMemo(() => {
    if (!building) return null;
    getBuildingName(building);
  }, [building]);
};
