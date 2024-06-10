import { EntityType } from "@/lib/constants";
import { reverseRecord } from "@/utils/global/common";
import { toHex32 } from "@/utils/global/encode";
import { Entity } from "@latticexyz/recs";
import { EBuilding, EUnit, EMap, EObjectives, EPointType, EResource } from "contracts/config/enums";

export const MapEntityLookup: Record<number, Entity> = {
  [EMap.Common]: EntityType.Common,
  [EMap.Kimberlite]: EntityType.Kimberlite,
  [EMap.Iridium]: EntityType.Iridium,
  [EMap.Platinum]: EntityType.Platinum,
  [EMap.Titanium]: EntityType.Titanium,
  [EMap.Wormhole]: EntityType.Wormhole,
};

/** Maps resource entities to EResource enums used in contracts. */
export const ResourceEnumLookup: Record<Entity, EResource> = {
  [EntityType.Iron]: EResource.Iron,
  [EntityType.Copper]: EResource.Copper,
  [EntityType.Lithium]: EResource.Lithium,
  [EntityType.Titanium]: EResource.Titanium,
  [EntityType.Iridium]: EResource.Iridium,
  [EntityType.Platinum]: EResource.Platinum,
  [EntityType.Kimberlite]: EResource.Kimberlite,
  [EntityType.Alloy]: EResource.Alloy,
  [EntityType.PVCell]: EResource.PVCell,
  [EntityType.IronPlate]: EResource.IronPlate,

  [EntityType.Electricity]: EResource.U_Electricity,
  [EntityType.Housing]: EResource.U_Housing,
  [EntityType.FleetCount]: EResource.U_MaxFleets,
  [EntityType.Defense]: EResource.U_Defense,
  [EntityType.Unraidable]: EResource.U_Unraidable,
  [EntityType.AdvancedUnraidable]: EResource.U_AdvancedUnraidable,
  [EntityType.DefenseMultiplier]: EResource.M_DefenseMultiplier,
  [EntityType.Encryption]: EResource.R_Encryption,
  [EntityType.HP]: EResource.R_HP,
};

/** Maps EResource enums used in contracts to entities. */
export const ResourceEntityLookup = reverseRecord(ResourceEnumLookup);

/** Maps building entities to EBuilding enums used in contracts. */
export const BuildingEnumLookup: Record<Entity, EBuilding> = {
  [EntityType.IronMine]: EBuilding.IronMine,
  [EntityType.CopperMine]: EBuilding.CopperMine,
  [EntityType.LithiumMine]: EBuilding.LithiumMine,
  [EntityType.TitaniumMine]: EBuilding.TitaniumMine,
  [EntityType.IridiumMine]: EBuilding.IridiumMine,
  [EntityType.KimberliteMine]: EBuilding.KimberliteMine,
  [EntityType.PlatinumMine]: EBuilding.PlatinumMine,
  [EntityType.IronPlateFactory]: EBuilding.IronPlateFactory,
  [EntityType.AlloyFactory]: EBuilding.AlloyFactory,
  [EntityType.PVCellFactory]: EBuilding.PVCellFactory,
  [EntityType.Garage]: EBuilding.Garage,
  [EntityType.Workshop]: EBuilding.Workshop,
  [EntityType.StorageUnit]: EBuilding.StorageUnit,
  [EntityType.SolarPanel]: EBuilding.SolarPanel,
  [EntityType.DroneFactory]: EBuilding.DroneFactory,
  [EntityType.Hangar]: EBuilding.Hangar,
  [EntityType.MainBase]: EBuilding.MainBase,
  [EntityType.WormholeBase]: EBuilding.WormholeBase,
  [EntityType.SAMLauncher]: EBuilding.SAM,
  [EntityType.StarmapperStation]: EBuilding.Starmapper,
  [EntityType.ShieldGenerator]: EBuilding.ShieldGenerator,
  [EntityType.Vault]: EBuilding.Vault,
  [EntityType.Market]: EBuilding.Market,
  [EntityType.Shipyard]: EBuilding.Shipyard,
};

/** Maps building enums used in contracts to entities. */
export const BuildingEntityLookup = reverseRecord(BuildingEnumLookup);

/** Maps unit entities to EUnit enums used in contracts. */
export const UnitEnumLookup: Record<Entity, EUnit> = {
  [EntityType.HammerDrone]: EUnit.HammerDrone,
  [EntityType.StingerDrone]: EUnit.StingerDrone,
  [EntityType.AnvilDrone]: EUnit.AnvilDrone,
  [EntityType.AegisDrone]: EUnit.AegisDrone,
  [EntityType.MinutemanMarine]: EUnit.MinutemanMarine,
  [EntityType.TridentMarine]: EUnit.TridentMarine,
  [EntityType.LightningCraft]: EUnit.LightningCraft,
  [EntityType.ColonyShip]: EUnit.ColonyShip,
  [EntityType.Droid]: EUnit.Droid,
};

export const UnitEntityLookup = reverseRecord(UnitEnumLookup);

/** Maps objective entities to EObjective enums used in contracts. */
export const ObjectiveEnumLookup: Record<Entity, EObjectives> = {
  ...Object.keys(EObjectives).reduce((acc, key) => {
    const elem = EObjectives[key as keyof typeof EObjectives];
    if (typeof elem === "number") {
      return { ...acc, [toHex32(key)]: elem };
    }
    return acc;
  }, {} as Record<string, EObjectives>),
};

/** Maps objective enums used in contracts to entities. */
export const ObjectiveEntityLookup = reverseRecord(ObjectiveEnumLookup);

export const LeaderboardEntityLookup = {
  player: {
    [EPointType.Shard]: EntityType.PlayerShardLeaderboard,
    [EPointType.Wormhole]: EntityType.PlayerWormholeLeaderboard,
  },
  alliance: {
    [EPointType.Shard]: EntityType.AllianceShardLeaderboard,
    [EPointType.Wormhole]: EntityType.AllianceWormholeLeaderboard,
  },
};
