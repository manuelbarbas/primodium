import { Entity } from "@latticexyz/recs";
import { EntityType } from "@/util/constants";
import { InterfaceIcons, ResourceImages, UnitImages } from "@primodiumxyz/assets";

export const MapIdToAsteroidType: Record<number, Entity> = {
  2: EntityType.Kimberlite,
  3: EntityType.Iridium,
  4: EntityType.Platinum,
  5: EntityType.Titanium,
};

export const EntityToUnitImage = {
  [EntityType.HammerDrone]: UnitImages.HammerDrone,
  [EntityType.StingerDrone]: UnitImages.StingerDrone,
  [EntityType.AnvilDrone]: UnitImages.AnvilDrone,
  [EntityType.AegisDrone]: UnitImages.AegisDrone,
  [EntityType.ColonyShip]: UnitImages.ColonyShip,
  [EntityType.Droid]: UnitImages.Droid,
  [EntityType.LightningCraft]: UnitImages.LightningCraft,
  [EntityType.MinutemanMarine]: UnitImages.MinutemenMarine,
  [EntityType.TridentMarine]: UnitImages.TridentMarine,
};

//TODO: Replace debug with actual images
export const EntityToResourceImage = {
  //Common
  [EntityType.Iron]: ResourceImages.Iron,
  [EntityType.Copper]: ResourceImages.Copper,
  [EntityType.Lithium]: ResourceImages.Lithium,

  //Advanced
  [EntityType.IronPlate]: ResourceImages.IronPlate,
  [EntityType.Alloy]: ResourceImages.Alloy,
  [EntityType.PVCell]: ResourceImages.PVC,

  //Rare
  [EntityType.Titanium]: ResourceImages.Titanium,
  [EntityType.Iridium]: ResourceImages.Iridium,
  [EntityType.Kimberlite]: ResourceImages.Kimberlite,
  [EntityType.Platinum]: ResourceImages.Platinum,

  //Utility
  [EntityType.Electricity]: ResourceImages.U_Electricity,
  [EntityType.Housing]: ResourceImages.U_Housing,
  [EntityType.FleetCount]: InterfaceIcons.Debug,
  [EntityType.ColonyShipCapacity]: InterfaceIcons.Debug,
  [EntityType.Defense]: ResourceImages.U_BuildingDefense,
  [EntityType.DefenseMultiplier]: ResourceImages.U_BuildingDefenseMult,
  [EntityType.Unraidable]: ResourceImages.U_Unraidable,
  [EntityType.AdvancedUnraidable]: ResourceImages.U_AdvancedUnraidable,
  [EntityType.Encryption]: ResourceImages.U_Encryption,
  [EntityType.HP]: InterfaceIcons.Debug,
};
