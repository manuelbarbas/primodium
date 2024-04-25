import { Entity } from "@latticexyz/recs";
import { Key } from "engine/types";
import { EntityType } from "@/util/constants";
import { UnitImages } from "@primodiumxyz/assets";

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

export const ResourceImage = new Map<Entity, string>([
  [EntityType.Iron, "/img/resource/iron_resource.png"],
  [EntityType.Copper, "/img/resource/copper_resource.png"],
  [EntityType.Lithium, "/img/resource/lithium_resource.png"],
  [EntityType.Titanium, "/img/resource/titanium_resource.png"],
  [EntityType.Iridium, "/img/resource/iridium_resource.png"],
  [EntityType.Kimberlite, "/img/resource/kimberlite_resource.png"],
  [EntityType.Platinum, "/img/resource/platinum_resource.png"],

  [EntityType.IronPlate, "/img/resource/ironplate.png"],

  [EntityType.Alloy, "/img/resource/alloy_resource.png"],
  [EntityType.PVCell, "/img/resource/photovoltaiccell_resource.png"],

  [EntityType.Electricity, "/img/ui/icons/battery.svg"],
  [EntityType.Housing, "/img/icons/utilitiesicon.png"],
  [EntityType.FleetCount, "/img/icons/moveicon.png"],
  [EntityType.ColonyShipCapacity, "/img/unit/colonyship.png"],
  [EntityType.Defense, "/img/icons/defenseicon.png"],
  [EntityType.DefenseMultiplier, "/img/icons/defenseicon.png"],
  [EntityType.Unraidable, "/img/icons/unraidableicon.png"],
  [EntityType.AdvancedUnraidable, "/img/icons/advancedunraidableicon.png"],
  [EntityType.Encryption, "/img/icons/encryptionicon.png"],
  [EntityType.HP, "/img/icons/reinforcementicon.png"],

  //units
  [EntityType.HammerDrone, "/img/unit/hammerdrone.png"],
  [EntityType.StingerDrone, "/img/unit/stingerdrone.png"],
  [EntityType.AnvilDrone, "/img/unit/anvildrone.png"],
  [EntityType.AegisDrone, "/img/unit/aegisdrone.png"],
  [EntityType.ColonyShip, "/img/unit/colonyship.png"],
  [EntityType.Droid, "/img/unit/droid.png"],
  [EntityType.MinutemanMarine, "img/unit/minutemen_marine.png"],
  [EntityType.TridentMarine, "img/unit/trident_marine.png"],
  [EntityType.LightningCraft, "img/unit/lightningcraft.png"],
]);

export const KeyImages = new Map<Key, string>([
  ["ONE", "/img/keys/one.png"],
  ["TWO", "/img/keys/two.png"],
  ["THREE", "/img/keys/three.png"],
  ["FOUR", "/img/keys/four.png"],
  ["FIVE", "/img/keys/five.png"],
  ["SIX", "/img/keys/six.png"],
  ["SEVEN", "/img/keys/seven.png"],
  ["EIGHT", "/img/keys/eight.png"],
  ["NINE", "/img/keys/nine.png"],
  ["ZERO", "/img/keys/zero.png"],
  ["Q", "/img/keys/q.png"],
  ["E", "/img/keys/e.png"],
]);
