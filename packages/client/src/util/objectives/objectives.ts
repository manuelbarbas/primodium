import { Entity } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";
import { EntityType, ObjectiveEnumLookup } from "../constants";
import { Objective } from "./types";

export const getObjective = (objectiveEntity: Entity) => {
  const objectiveEnum = ObjectiveEnumLookup[objectiveEntity];

  if (!objectiveEnum) return;

  const objective = Objectives.get(objectiveEnum);
  if (!objective) return;
  return objective;
};

export const Objectives = new Map<EObjectives, Objective>([
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
    EObjectives.BuildStarmapper,
    {
      type: "Build",
      buildingType: EntityType.LithiumMine,
      requiredMainBase: 2n,
      description: "A starmapper station increases the number of fleets you can create.",
    },
  ],
  [
    EObjectives.BuildSAMLauncher,
    {
      type: "Build",
      buildingType: EntityType.LithiumMine,
      requiredMainBase: 2n,
      description: "SAM sites protect you from enemy attacks and raids by providing defense.",
    },
  ],
  [
    EObjectives.BuildVault,
    {
      type: "Build",
      buildingType: EntityType.LithiumMine,
      requiredMainBase: 2n,
      description: "Vaults protect your resources from being raided.",
    },
  ],

  [
    EObjectives.BuildShieldGenerator,
    {
      type: "Build",
      buildingType: EntityType.LithiumMine,
      requiredMainBase: 2n,
      description: "Shield generators boost your asteroid's defense.",
    },
  ],
  [
    EObjectives.BuildShipyard,
    {
      type: "Build",
      buildingType: EntityType.LithiumMine,
      requiredMainBase: 2n,
      description: "Shipyards constuct Colony Ships, which colonize asteroids.",
    },
  ],
  [
    EObjectives.BuildMarket,
    {
      type: "Build",
      buildingType: EntityType.LithiumMine,
      requiredMainBase: 2n,
      description: "Markets trade resources with other players. There is a tax on all trades.",
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
  [
    EObjectives.TrainTridentMarines,
    {
      type: "Train",
      unitType: EntityType.MinutemanMarine,
      unitCount: 16n,
      requiredMainBase: 2n,
      description:
        "Select the workshop you placed on the map to train Trident marines. Trident marines are basic well-rounded units.",
    },
  ],
  [
    EObjectives.TrainLightningCrafts,
    {
      type: "Train",
      unitType: EntityType.LightningCraft,
      unitCount: 16n,
      requiredMainBase: 2n,
      description:
        "Upgrade the workshop you placed on the map to Level 2 to unlock the ability to train Lightning Ships. Lightning Ships are weak but travel extremely fast without other types of ships.",
    },
  ],
  [
    EObjectives.TrainAnvilDrones,
    {
      type: "Train",
      unitType: EntityType.AnvilDrone,
      unitCount: 16n,
      requiredMainBase: 2n,
      description:
        "Select the drone factory you placed on the map to build anvil drones. Anvil drones are standard defensive drones.",
    },
  ],
  [
    EObjectives.TrainHammerDrones,
    {
      type: "Train",
      unitType: EntityType.HammerDrone,
      unitCount: 16n,
      requiredMainBase: 2n,
      description:
        "Select the drone factory you placed on the map to build hammer drones. Hammer drones are standard attacking drones.",
    },
  ],
  [
    EObjectives.TrainAegisDrones,
    {
      type: "Train",
      unitType: EntityType.AegisDrone,
      unitCount: 16n,
      requiredMainBase: 2n,
      description:
        "Upgrade the drone factory you placed on the map to Level 2 to unlock the ability to build Aegis drones. Aegis drones are strong but slow defensive units and take up more housing.",
    },
  ],
  [
    EObjectives.TrainStingerDrones,
    {
      type: "Train",
      unitType: EntityType.StingerDrone,
      unitCount: 16n,
      requiredMainBase: 2n,
      description:
        "Upgrade the drone factory you placed on the map to Level 3 to unlock the ability to build Stinger drones. Stinger drones are strong but slow offensive units and take up more housing.",
    },
  ],
  [
    EObjectives.TrainColonyShip,
    {
      type: "Train",
      unitType: EntityType.ColonyShip,
      unitCount: 16n,
      requiredMainBase: 2n,
      description:
        "Select the Shipyard you placed on the map to build a Colony Ship. Colony ships can decrypt other asteroids and colonize on them.",
    },
  ],
  [
    EObjectives.ExpandBase1,
    {
      type: "Expand",
      level: 2n,
      requiredMainBase: 2n,
      description:
        "Select your main base and click on Expand base to expand your buildable zone and uncover more resource ores.",
    },
  ],
  [
    EObjectives.OpenBattleReport,
    {
      type: "Claim",
      requiredObjectives: [EObjectives.BattleAsteroid],
      description: "Open a battle report to see the results of a battle.",
    },
  ],
  [
    EObjectives.CreateFleet,
    {
      type: "Claim",
      description:
        'Fleets transport units and resources between asteroids. Create a fleet on the starmap by selecting your asteroid and pressing "Create Fleet".',
    },
  ],
  [
    EObjectives.TransferToAsteroid,
    {
      type: "Claim",
      description:
        "Transfer units and resources to an asteroid by selecting the asteroid and pressing the Transfer button.",
    },
  ],
  [
    EObjectives.TransferToFleet,
    {
      type: "Claim",
      description: "Transfer units and resources to a fleet by selecting the fleet and pressing the Transfer button.",
    },
  ],
  [
    EObjectives.RecallFleet,
    {
      type: "Claim",
      description:
        "Recalling a fleet allows it to return to its origin mid-flight. To recall, select a fleet and press the Recall button.",
    },
  ],
  [
    EObjectives.LandFleet,
    {
      type: "Claim",
      description:
        "Landing a fleet on an asteroid sets the fleet's owner to that asteroid. It also deposit all resources and units. To land, select a fleet and press the Land button.",
    },
  ],
  [
    EObjectives.SendFleet,
    {
      type: "Claim",
      description:
        "Sending a fleet to an asteroid allows it to deposit resources and units or fight other fleets. To send, select a fleet and press the Send button. Then select the destination asteroid.",
    },
  ],
  //   BattleAsteroid,
  //   BattleFleet,
  //   SuccessfulRaid,
  //   UpgradeUnitType,
  //   BuildColonyShip,
  //   DecryptAttack,
  //   CaptureAsteroid,

  //   MarketSwap,
  //   MarketLiquidity,

  //   JoinAlliance,
]);
