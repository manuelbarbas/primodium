import { Entity } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";
import { EntityType, ObjectiveEnumLookup } from "../constants";
import { Objective, ObjectiveType } from "./types";

export const getObjective = (objectiveEntity: Entity) => {
  const objectiveEnum = ObjectiveEnumLookup[objectiveEntity];

  if (!objectiveEnum) return;

  const objective = Objectives.get(objectiveEnum);
  if (!objective) return;
  return objective;
};

export const Objectives = new Map<EObjectives, Objective & { type: ObjectiveType; description?: string }>([
  //landscape blocks
  [
    EObjectives.BuildIronMine,
    {
      description:
        "Select the iron mine on the building menu. Place it on an ore tile. It will start producing iron, which you can see in your Resources.",
      type: "Build",
      buildingType: EntityType.IronMine,
      level: 1n,
    },
  ],
  [
    EObjectives.BuildCopperMine,
    {
      type: "Build",
      buildingType: EntityType.CopperMine,
      level: 1n,

      description: "Select the copper mine on the building menu. Place it on an ore tile.",
    },
  ],
  [
    EObjectives.BuildGarage,
    {
      type: "Build",
      buildingType: EntityType.Garage,
      level: 1n,
      description:
        "Garages provide housing for units. To build, Select the garage from the building menu. Place it on any empty tile.",
    },
  ],
  [
    EObjectives.BuildWorkshop,
    {
      type: "Build",
      buildingType: EntityType.Garage,
      level: 1n,
      description:
        "Workshops train marines, a basic unit. To build, select the workshop from the building menu and place it on any empty tile.",
    },
  ],

  // [EObjectives.UpgradeMainBase, "Upgrade your main base by clicking on the upgrade button in your main base."],

  [
    EObjectives.BuildLithiumMine,
    {
      type: "Build",
      buildingType: EntityType.LithiumMine,
      level: 1n,
      requiredMainBase: 2n,

      description: "Select the lithium mine on the building menu. Place it on an ore tile.",
    },
  ],
  // [
  //   EObjectives.BuildIronPlateFactory,
  //   "Select the plating factory on the building menu and place it on an empty tile. It produces iron plates by consuming iron production.",
  // ],
  // [
  //   EObjectives.BuildPVCellFactory,
  //   "Select the photovoltaic cell factory on the building menu and place it on an empty tile. It produces photovoltaic cells by consuming lithium production.",
  // ],

  // [
  //   EObjectives.BuildStorageUnit,
  //   "Select the Storage Unit from the building menu and place it on an empty tile. Storage units increase your resource storage.",
  // ],
  // [
  //   EObjectives.BuildSolarPanel,
  //   "Select the solar panel from the building menu and place it on an empty tile. Solar panels provide electricity, which is used for advanced buildings.",
  // ],
  // [
  //   EObjectives.BuildDroneFactory,
  //   "Select the drone factory from the building menu and place it on an empty tile. Drone factories train drones, which are stronger.",
  // ],
  // [
  //   EObjectives.BuildHangar,
  //   "Select the hangar from the building menu and place it on an empty tile. Hangars provide more housing for units than Garages.",
  // ],
  // [
  //   EObjectives.TrainMinutemanMarines,
  //   "Select the workshop you placed on the map to train Minuteman marines. Minutemen are weak units that are fast to build, fast to travel, and carry lots of cargo.",
  // ],
  // [
  //   EObjectives.TrainTridentMarines,
  //   "Select the workshop you placed on the map to train Trident marines. Trident marines are basic well-rounded units.",
  // ],
  // [
  //   EObjectives.TrainLightningShips,
  //   "Upgrade the workshop you placed on the map to Level 2 to unlock the ability to train Lightning Ships. Lightning Ships are weak but travel extremely fast without other types of ships.",
  // ],
  // [
  //   EObjectives.TrainAnvilDrones,
  //   "Select the drone factory you placed on the map to build anvil drones. Anvil drones are standard defensive drones.",
  // ],
  // [
  //   EObjectives.TrainHammerDrones,
  //   "Select the drone factory you placed on the map to build hammer drones. Hammer drones are standard attacking drones.",
  // ],
  // [
  //   EObjectives.TrainAegisDrones,
  //   "Upgrade the drone factory you placed on the map to Level 2 to unlock the ability to build Aegis drones. Aegis drones are strong but slow defensive units and take up more housing.",
  // ],
  // [
  //   EObjectives.TrainStingerDrones,
  //   "Upgrade the drone factory you placed on the map to Level 3 to unlock the ability to build Stinger drones. Stinger drones are strong but slow offensive units and take up more housing.",
  // ],
  // [
  //   EObjectives.BuildColonyShips,
  //   "Select the Shipyard you placed on the map to build a Colony Ship. Colony ships can decrypt other asteroids and colonize on them.",
  // ],
  // [
  //   EObjectives.ExpandBase1,
  //   "Select your main base and click on Expand base to expand your buildable zone and uncover more resource ores.",
  // ],
  // [
  //   EObjectives.BuildStarmapper,
  //   "Construct a starmapper station. A starmapper station increases the number of fleets you can send at a time.",
  // ],
  // [
  //   EObjectives.BuildSAMLauncher,
  //   "Construct a SAM site. SAM sites protect you from enemy attacks and raids by providing a base level of defense.",
  // ],
  // [EObjectives.BuildVault, "Build a vault. Vaults protect your resources from being raided."],

  // [
  //   EObjectives.BuildShieldGenerator,
  //   "Build a shield generator. Shield generators multiply your asteroid's defense numbers.",
  // ],
  // [
  //   EObjectives.BuildShipyard,
  //   "Select the Shipyard from the building menu and place it on an empty tile. Shipyards can build Colony Ships, which are used to colonize other asteroids.",
  // ],
  // [
  //   EObjectives.BuildMarket,
  //   "Build a Market. A Market is used to globally trade resources with other players for a built-in percentage fee.",
  // ],
]);
