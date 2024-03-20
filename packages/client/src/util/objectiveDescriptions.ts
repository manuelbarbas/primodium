import { Entity } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";
import { ObjectiveEnumLookup } from "./constants";

export const getObjectiveDescription = (objective: Entity) => {
  const objectiveEnum = ObjectiveEnumLookup[objective];
  if (!objectiveEnum) return "";

  return ObjectiveDescriptions.get(objectiveEnum);
};

export const ObjectiveDescriptions = new Map<EObjectives, string>([
  //landscape blocks
  [
    EObjectives.BuildIronMine,
    "Select the iron mine on the building menu below and place it on the iron ore tile. Iron mines produce iron.",
  ],
  [
    EObjectives.BuildCopperMine,
    "Select the copper mine on the building menu below and place it on the copper ore tile. Copper mines produce copper.",
  ],
  [
    EObjectives.BuildLithiumMine,
    "Select the lithium mine on the building menu below and place it on the lithium ore tile. Lithium mines produce lithium.",
  ],
  [
    EObjectives.BuildIronPlateFactory,
    "Select the plating factory on the building menu and place it on an empty tile. It produces iron plates by consuming iron production.",
  ],
  [
    EObjectives.BuildPVCellFactory,
    "Select the photovoltaic cell factory on the building menu and place it on an empty tile. It produces photovoltaic cells by consuming lithium production.",
  ],
  [
    EObjectives.BuildGarage,
    "Select the garage from the building menu and place it on an empty tile. Garages provide housing for units.",
  ],
  [
    EObjectives.BuildWorkshop,
    "Select the workshop from the building menu and place it on an empty tile. Workshops train basic units, like marines.",
  ],
  [
    EObjectives.BuildSolarPanel,
    "Select the solar panel from the building menu and place it on an empty tile. Solar panels provide electricity, which is used for advanced buildings.",
  ],

  [
    EObjectives.BuildDroneFactory,
    "Select the drone factory from the building menu and place it on an empty tile. Drone factories train drones, which are stronger.",
  ],

  [
    EObjectives.BuildHangar,
    "Select the hangar from the building menu and place it on an empty tile. Hangars provide more housing for units than Garages.",
  ],

  [
    EObjectives.TrainMinutemanMarine1,
    "Select the workshop you placed on the map to train Minuteman marines. Minutemen are weak units that are fast to build, fast to travel, and carry lots of cargo.",
  ],

  [
    EObjectives.TrainTridentMarine1,
    "Select the workshop you placed on the map to train Trident marines. Trident marines are basic well-rounded units.",
  ],

  [
    EObjectives.TrainLightningShip1,
    "Upgrade the workshop you placed on the map to Level 2 to unlock the ability to train Lightning Ships. Lightning Ships are weak but travel extremely fast without other types of ships.",
  ],

  [
    EObjectives.TrainAnvilDrone1,
    "Select the drone factory you placed on the map to build anvil drones. Anvil drones are standard defensive drones.",
  ],

  [
    EObjectives.TrainHammerDrone1,
    "Select the drone factory you placed on the map to build hammer drones. Hammer drones are standard attacking drones.",
  ],

  [
    EObjectives.TrainAegisDrone1,
    "Upgrade the drone factory you placed on the map to Level 2 to unlock the ability to build Aegis drones. Aegis drones are strong but slow defensive units and take up more housing.",
  ],

  [
    EObjectives.TrainStingerDrone1,
    "Upgrade the drone factory you placed on the map to Level 3 to unlock the ability to build Stinger drones. Stinger drones are strong but slow offensive units and take up more housing.",
  ],

  [
    EObjectives.BuildCapitalShip1,
    "Select the Shipyard you placed on the map to build a Capital Ship. Capital ships can decrypt other asteroids and colonize on them.",
  ],

  [EObjectives.UpgradeMainBase, "Upgrade your main base by clicking on the upgrade button in your main base."],

  [
    EObjectives.ExpandBase1,
    "Select your main base and click on Expand base to expand your buildable zone and uncover more resource ores.",
  ],

  [
    EObjectives.DefeatPirateBase1,
    "Select the starmap on the top of your screen, then choose the red tinted pirate asteroid and send units to attack and raid.",
  ],

  [
    EObjectives.BuildStarmapper,
    "Construct a starmapper station. A starmapper station increases the number of fleets you can send at a time.",
  ],

  [
    EObjectives.BuildSAMLauncher,
    "Construct a SAM site. SAM sites protect you from enemy attacks and raids by providing a base level of defense.",
  ],

  [EObjectives.BuildVault, "Build a vault. Vaults protect your resources from being raided."],

  [
    EObjectives.BuildShieldGenerator,
    "Build a shield generator. Shield generators multiply your asteroid's defense numbers.",
  ],

  [
    EObjectives.BuildShipyard,
    "Select the Shipyard from the building menu and place it on an empty tile. Shipyards can build Capital Ships, which are used to colonize other asteroids.",
  ],

  [
    EObjectives.BuildMarket,
    "Build a Market. A Market is used to globally trade resources with other players for a built-in percentage fee.",
  ],
]);
