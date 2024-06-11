import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { useCore } from "@/react/hooks/useCore";

/**
 * Retrieves building information based on the provided building entity.
 * @param building - The building entity for which to retrieve information.
 * @returns The building information.
 */
export const useBuildingInfo = (building: Entity) => {
  const {
    tables,
    utils: { getBuildingInfo },
  } = useCore();
  const buildingLevel = tables.Level.use(building)?.value;

  return useMemo(() => getBuildingInfo(building), [building, buildingLevel]);
};
