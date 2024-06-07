import { DECIMALS } from "contracts/config/constants";
import { EntityType, UnitEnumLookup } from "@/lib/constants";
import { Entity } from "@latticexyz/recs";

export const getScale = (resource: Entity) => {
  return 10 ** getResourceDecimals(resource);
};

const unscaledResources = new Set([
  ...Object.keys(UnitEnumLookup),
  EntityType.FleetCount,
  EntityType.ColonyShipCapacity,
  EntityType.Housing,
]);

const multipliers = new Set([EntityType.DefenseMultiplier, EntityType.UnitProductionMultiplier]);

export const getResourceDecimals = (resource: Entity) =>
  unscaledResources.has(resource) ? 0 : multipliers.has(resource) ? 2 : DECIMALS;
