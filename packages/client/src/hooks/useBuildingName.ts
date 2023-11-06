import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { getBlockTypeName, toRomanNumeral } from "src/util/common";

export const useBuildingName = (building: Entity | undefined) => {
  const buildingType = components.BuildingType.use(building)?.value as Entity;
  const level = components.Level.use(building)?.value ?? 1n;

  return useMemo(() => `${getBlockTypeName(buildingType)} ${toRomanNumeral(Number(level))}`, [buildingType, level]);
};
