import { EntityType } from "@/lib/constants";
import { Entity } from "@latticexyz/recs";
import { EMap } from "contracts/config/enums";

export const MapIdToAsteroidType: Record<number, Entity> = {
  [EMap.Common]: EntityType.Common,
  [EMap.Kimberlite]: EntityType.Kimberlite,
  [EMap.Iridium]: EntityType.Iridium,
  [EMap.Platinum]: EntityType.Platinum,
  [EMap.Titanium]: EntityType.Titanium,
  [EMap.Wormhole]: EntityType.Wormhole,
};
