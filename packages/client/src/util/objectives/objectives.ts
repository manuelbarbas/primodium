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
      type: "Build",
      buildingType: EntityType.IronMine,
      description:
        "Iron mines produce iron, which you can see in the Resources pane. To build, the iron mine on the building menu. Place it on an ore tile. ",
    },
  ],
  [
    EObjectives.BuildCopperMine,
    {
      type: "Build",
      buildingType: EntityType.CopperMine,
      description: "Copper mines produce copper. Select the copper mine on the building menu. Place it on an ore tile.",
    },
  ],
  [
    EObjectives.BuildGarage,
    {
      type: "Build",
      buildingType: EntityType.Garage,
      requiredObjectives: [EObjectives.BuildIronMine, EObjectives.BuildWorkshop],
      description:
        "Garages provide housing for units. To build, Select the garage from the building menu. Place it on any empty tile.",
    },
  ],
  [
    EObjectives.BuildWorkshop,
    {
      type: "Build",
      buildingType: EntityType.Workshop,
      description:
        "Workshops train marines, which are basic units. To build, select the workshop from the building menu and place it on any empty tile.",
    },
  ],

  [
    EObjectives.UpgradeMainBase,
    {
      type: "Upgrade",
      buildingType: EntityType.MainBase,
      level: 2n,
      description:
        "Upgrading a main base gives you more resource storage and makes your asteroid stronger. To upgrade, select your main base and press UPGRADE.",
    },
  ],
  [
    EObjectives.BuildLithiumMine,
    {
      type: "Build",
      buildingType: EntityType.LithiumMine,
      requiredMainBase: 2n,

      description:
        "Lithium mines produce lithium. To build, select the lithium mine in the building menu. Place it on an ore tile.",
    },
  ],
  [
    EObjectives.BuildIronPlateFactory,
    {
      type: "Build",
      buildingType: EntityType.IronPlateFactory,
      description:
        "Iron Plate Factories produce iron plates by burning iron. To build, select the factory in the building menu. Place it on any empty tile.",
    },
  ],
  [
    EObjectives.BuildPVCellFactory,
    {
      type: "Build",
      buildingType: EntityType.PVCellFactory,
      requiredMainBase: 2n,
      description:
        "The PV Cell factory produces photovoltaic cells by burning lithium. To build, select the PV Cell factory on the building menu and place it on any empty tile.",
    },
  ],

  [
    EObjectives.BuildStorageUnit,
    {
      type: "Build",
      buildingType: EntityType.StorageUnit,
      requiredMainBase: 2n,
      description:
        "Storage units increase your resource storage. To build, select the Storage Unit from the building menu and place it on any empty tile.",
    },
  ],
  [
    EObjectives.BuildSolarPanel,
    {
      type: "Build",
      buildingType: EntityType.SolarPanel,
      requiredMainBase: 2n,
      description:
        "Solar panels provide electricity, which is used for advanced buildings. To build, select the solar panel from the building menu and place it on any empty tile.",
    },
  ],
  [
    EObjectives.BuildDroneFactory,
    {
      type: "Build",
      buildingType: EntityType.DroneFactory,
      requiredMainBase: 2n,
      description:
        "Drone factories train drones, which are strong and specialized. To build, select the drone factory from the building menu and place it on any empty tile.",
    },
  ],
  [
    EObjectives.BuildHangar,
    {
      type: "Build",
      buildingType: EntityType.LithiumMine,
      requiredMainBase: 2n,
      description:
        "Hangars provide large amounts of housing for units. To build, select the hangar from the building menu and place it on an empty tile.",
    },
  ],
  [
    EObjectives.TrainMinutemanMarines,
    {
      type: "Train",
      unitType: EntityType.MinutemanMarine,
      unitCount: 16n,
      requiredMainBase: 2n,
      description:
        "Minutemen are weak units that are trained quickly, move fast, and carry lots of cargo. To train, select a workshop and press TRAIN UNITS.",
    },
  ],
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
