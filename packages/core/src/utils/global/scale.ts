import { Entity } from "@primodiumxyz/reactive-tables";
import { DECIMALS } from "contracts/config/constants";
import { EntityType, UnitEnumLookup } from "@/lib";

/**
 * Gets the scale of a resource.
 * @param resource - The resource entity.
 * @returns The scale.
 */
export const getScale = (resource: Entity): number => {
  return 10 ** getResourceDecimals(resource);
};

const unscaledResources = new Set([
  ...Object.keys(UnitEnumLookup),
  EntityType.FleetCount,
  EntityType.ColonyShipCapacity,
  EntityType.Housing,
]);

const multipliers = new Set([EntityType.DefenseMultiplier, EntityType.UnitProductionMultiplier]);

/**
 * Gets the decimal places for a resource.
 * @param resource - The resource entity.
 * @returns The number of decimal places.
 */
export const getResourceDecimals = (resource: Entity): number =>
  unscaledResources.has(resource) ? 0 : multipliers.has(resource) ? 2 : DECIMALS;
