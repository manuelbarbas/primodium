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
  /* ---------------------------------- A Fundamentals --------------------------------- */
  [
    EObjectives.BuildIronMine,
    {
      category: "Fundamentals",
      type: "Build",
      buildingType: EntityType.IronMine,
      description:
        "Iron mines produce iron, which you can see in the Resources pane. To build, the iron mine on the building menu. Place it on an ore tile. ",
    },
  ],
  [
    EObjectives.BuildCopperMine,
    {
      category: "Fundamentals",
      type: "Build",
      buildingType: EntityType.CopperMine,
      description: "Copper mines produce copper. Select the copper mine on the building menu. Place it on an ore tile.",
    },
  ],
  [
    EObjectives.BuildIronPlateFactory,
    {
      category: "Fundamentals",
      type: "Build",
      requiredObjectives: [EObjectives.BuildIronMine, EObjectives.BuildCopperMine],
      buildingType: EntityType.IronPlateFactory,
      description:
        "Iron Plate Factories produce iron plates by burning iron. To build, select the factory in the building menu. Place it on any empty tile.",
    },
  ],
  [
    EObjectives.UpgradeMainBase,
    {
      category: "Fundamentals",
      type: "Upgrade",
      requiredObjectives: [EObjectives.BuildCopperMine],
      buildingType: EntityType.MainBase,
      level: 2n,
      description:
        "Upgrading a main base gives you more resource storage and makes your asteroid stronger. To upgrade, select your main base and press Upgrade.",
    },
  ],
  [
    EObjectives.ExpandBase1,
    {
      category: "Fundamentals",
      type: "Expand",
      level: 2n,
      requiredObjectives: [EObjectives.BuildIronMine],
      requiredMainBase: 2n,
      description:
        "Expansion gives you more room to build and unlocks new ores. To Expand, Select your main base and click on Expand base.",
    },
  ],

  /* ----------------------------- A-A Conquest Basics ---------------------------- */

  [
    EObjectives.BuildGarage,
    {
      category: "Unit Production",
      type: "Build",
      buildingType: EntityType.Garage,
      requiredObjectives: [EObjectives.ExpandBase1],
      description:
        "Garages provide housing for units. To build, Select the garage from the building menu. Place it on any empty tile.",
    },
  ],
  [
    EObjectives.BuildWorkshop,
    {
      category: "Unit Production",
      type: "Build",
      buildingType: EntityType.Workshop,
      requiredObjectives: [EObjectives.BuildGarage],
      description:
        "Workshops train marines, which are basic units. To build, select the workshop from the building menu and place it on any empty tile.",
    },
  ],
  [
    EObjectives.CreateFleet,
    {
      category: "Fleet",
      type: "Claim",
      requiredObjectives: [EObjectives.BuildWorkshop],
      description:
        'Fleets transport units and resources between asteroids. Create a fleet on the starmap by selecting your asteroid and pressing "Create Fleet".',
      icon: "/img/icons/outgoingicon.png",
      tooltip: "Created a fleet",
    },
  ],

  /* ------------------------------ A-A-A Fleet ------------------------------ */
  [
    EObjectives.TransferToFleet,
    {
      category: "Fleet",
      type: "Claim",
      requiredObjectives: [EObjectives.CreateFleet],
      description: "Transfer units and resources to a fleet by selecting the fleet and pressing the Transfer button.",
      icon: "/img/icons/tradeicon.png",
      tooltip: "Executed a transfer",
    },
  ],
  [
    EObjectives.SendFleet,
    {
      category: "Fleet",
      type: "Claim",
      requiredObjectives: [EObjectives.TransferToFleet],
      description:
        "Sending a fleet to an asteroid allows it to deposit resources and units or fight other fleets. To send, select a fleet and press the Send button. Then select the target asteroid.",
      icon: "/img/icons/moveicon.png",
      tooltip: "Executed a fleet send",
    },
  ],
  [
    EObjectives.BattleAsteroid,
    {
      category: "Combat",
      type: "Claim",
      requiredObjectives: [EObjectives.BattleAsteroid],
      description:
        "Battling an asteroid allows you to raid resources. To battle, select a fleet and press the Attack button. Then select the target asteroid.",
      icon: "/img/icons/attackicon.png",
      tooltip: "Executed an attack",
    },
  ],
  [
    EObjectives.OpenBattleReport,
    {
      category: "Combat",
      type: "Claim",
      requiredObjectives: [EObjectives.BattleAsteroid],
      description: "Open a battle report to see the results of a battle.",
      icon: "/img/icons/reportsicon.png",
      tooltip: "Viewed a battle report",
    },
  ],

  /* ------------------------------ A-A-A-A Fleet Combat ------------------------------ */

  [
    EObjectives.BattleFleet,
    {
      category: "Combat",
      type: "Claim",
      requiredObjectives: [EObjectives.OpenBattleReport],
      description:
        "Battling a fleet lets you defend asteroids and steal resources. To battle, select a fleet or asteroid and press the Attack button. Then select the target fleet.",
      icon: "/img/icons/attackicon.png",
      tooltip: "Executed an attack",
    },
  ],

  /* -------------------------- A-A-A-B Conquest (continued) ------------------------- */
  [
    EObjectives.BuildShipyard,
    {
      category: "Conquest",
      type: "Build",
      requiredObjectives: [EObjectives.OpenBattleReport],
      buildingType: EntityType.Shipyard,
      requiredMainBase: 2n,
      description: "Shipyards constuct Colony Ships, which colonize asteroids.",
    },
  ],
  [
    EObjectives.TrainColonyShip,
    {
      category: "Conquest",
      type: "Train",
      requiredObjectives: [EObjectives.BuildShipyard],
      unitType: EntityType.ColonyShip,
      unitCount: 16n,
      requiredMainBase: 2n,
      description:
        "Select the Shipyard you placed on the map to build a Colony Ship. Colony ships can decrypt other asteroids and colonize on them.",
    },
  ],
  [
    EObjectives.DecryptAttack,
    {
      category: "Conquest",
      type: "Claim",
      requiredObjectives: [EObjectives.TrainColonyShip],
      description:
        "Once an asteroid's decryption reaches zero, you can conquer it. To decrypt an asteroid, attack it using a fleet with a Colony Ship. View the asteroid's decryption when you hover.",
      icon: "/img/icons/encryptionicon.png",
      tooltip: "Decrypted an asteroid",
    },
  ],
  [
    EObjectives.CaptureAsteroid,
    {
      category: "Conquest",
      type: "Claim",
      requiredObjectives: [EObjectives.DecryptAttack],
      description:
        "Capturing an asteroid allows you to take control of it. To capture, you need to reduce an asteroid's encryption to 0 using Colony Ships.",
      icon: "/img/icons/encryptionicon.png",
      tooltip: "Captured an asteroid",
    },
  ],

  /* --------------------- A-A-A-B-A Motherlode Extraction -------------------- */
  [
    EObjectives.CaptureMotherlodeAsteroid,
    {
      category: "Motherlode",
      type: "Claim",
      requiredObjectives: [EObjectives.CaptureAsteroid],
      description:
        "Capturing motherlode asteroids lets you mine elite resources. Capture a motherlode asteroid near your home asteroid (hint: elite resources are Kimberlite, Iridium, Titanium, and Platinum).",
      icon: "/img/resource/iridium_resource.png",
      tooltip: "Extracted a motherlode",
    },
  ],

  [
    EObjectives.ExtractMotherlodeResource,
    {
      category: "Motherlode",
      type: "Claim",
      requiredObjectives: [EObjectives.CaptureMotherlodeAsteroid],
      description:
        "To extract an elite resource, capture a motherlode asteroid and build an elite mine on an ore tile.",
      icon: "/img/resource/iridium_resource.png",
      tooltip: "Extracted a motherlode",
    },
  ],

  /* ------------------------ A-A-A-B-B Primodium Points ----------------------- */

  [
    EObjectives.ClaimAsteroidPrimodium,
    {
      category: "Victory (Primodium)",
      type: "Claim",
      requiredObjectives: [EObjectives.CaptureAsteroid],
      description:
        "Claiming Primodium allows you to win the game. To claim, capture asteroids and hold them until you can claim their Primodium.",
      icon: "/img/icons/leaderboardicon.png",
      tooltip: "Claimed Primodium",
    },
  ],
  [
    EObjectives.ClaimShardPrimodium,
    {
      category: "Victory (Primodium)",
      type: "Claim",
      requiredObjectives: [EObjectives.CaptureAsteroid],
      description:
        "Volatile Shards are rare space rocks that are made of 100% Primodium. Over time, a Shard leaches Primodium to the player controlling it. Beware, they regularly explode and annihilate anything nearby! To claim, capture a Shard and start earning its Primodium.",
      icon: "/img/icons/leaderboardicon.png",
      tooltip: "Claimed Primodium",
    },
  ],

  /* ------------------------- A-A-A-B-C Extraction Points ------------------------ */

  [
    EObjectives.CaptureWormholeAsteroid,
    {
      category: "Victory (Wormhole)",
      type: "Claim",
      requiredObjectives: [EObjectives.BuildStorageUnit],
      description:
        "A wormhole asteroid is a special asteroid that lets you earn points on the Extraction leaderboard. To capture, decrypt a nearby Wormhole Asteroid.",
      icon: "/img/icons/leaderboardicon.png",
      tooltip: "Captured wormhole asteroid",
    },
  ],
  [
    EObjectives.ClaimExtractionPoints,
    {
      category: "Victory (Wormhole)",
      type: "Claim",
      requiredObjectives: [EObjectives.BuildStorageUnit],
      description:
        "Claiming extraction points improves your rank on the Extraction leaderboard. To claim, click on a Wormhole Generator and send it the resource it currently requires.",
      icon: "/img/icons/leaderboardicon.png",
      tooltip: "Claimed extraction points",
    },
  ],
  /* ------------------------ A-A-A-C Fleet Management ------------------------ */
  [
    EObjectives.TransferToAsteroid,
    {
      category: "Fleet",
      type: "Claim",
      requiredObjectives: [EObjectives.OpenBattleReport],
      description:
        "Transfer units and resources to an asteroid by selecting the asteroid and pressing the Transfer button.",
      icon: "/img/icons/tradeicon.png",
      tooltip: "Executed a transfer",
    },
  ],
  [
    EObjectives.BuildStarmapper,
    {
      category: "Fleet",
      type: "Build",
      requiredObjectives: [EObjectives.TransferToAsteroid],
      buildingType: EntityType.StarmapperStation,
      requiredMainBase: 2n,
      description: "A starmapper station increases the number of fleets you can create.",
    },
  ],
  [
    EObjectives.LandFleet,
    {
      category: "Fleet",
      type: "Claim",
      requiredObjectives: [EObjectives.LandFleet],
      description:
        "Landing a fleet on an asteroid sets the fleet's owner to that asteroid. It also deposit all resources and units. To land, select a fleet and press the Land button.",
      icon: "/img/icons/moveicon.png",
      tooltip: "Landed a fleet",
    },
  ],
  [
    EObjectives.RecallFleet,
    {
      category: "Fleet",
      type: "Claim",
      requiredObjectives: [EObjectives.RecallFleet],
      description:
        "Recalling a fleet allows it to return to its origin mid-flight. To recall, select a fleet and press the Recall button.",
      icon: "/img/icons/moveicon.png",
      tooltip: "Recalled a fleet",
    },
  ],

  /* ----------------------- A-A-B Unit Production ---------------------- */
  [
    EObjectives.TrainMinutemanMarines,
    {
      category: "Unit Production",
      type: "Train",
      requiredObjectives: [EObjectives.CreateFleet],
      unitType: EntityType.MinutemanMarine,
      unitCount: 16n,
      requiredMainBase: 2n,
      description:
        "Minutemen are weak units that are trained quickly, move fast, and carry lots of cargo. To train, select a workshop and press Train Units.",
    },
  ],
  [
    EObjectives.TrainTridentMarines,
    {
      category: "Unit Production",
      type: "Train",
      requiredObjectives: [EObjectives.TrainMinutemanMarines],
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
      category: "Unit Production",
      type: "Train",
      requiredObjectives: [EObjectives.TrainLightningCrafts],
      unitType: EntityType.LightningCraft,
      unitCount: 16n,
      requiredMainBase: 2n,
      description:
        "Upgrade the workshop you placed on the map to Level 2 to unlock the ability to train Lightning Ships. Lightning Ships are weak but travel extremely fast without other types of ships.",
    },
  ],

  /* --------------------- A-A-B-A Unit Production (cont) --------------------- */
  [
    EObjectives.BuildDroneFactory,
    {
      category: "Unit Production",
      type: "Build",
      requiredObjectives: [EObjectives.CreateFleet],
      buildingType: EntityType.DroneFactory,
      requiredMainBase: 2n,
      description:
        "Drone factories train drones, which are strong and specialized. To build, select the drone factory from the building menu and place it on any empty tile.",
    },
  ],
  [
    EObjectives.UpgradeUnit,
    {
      category: "Unit Production",
      type: "Claim",
      requiredObjectives: [EObjectives.BuildDroneFactory],
      description:
        "Upgrading a unit increases its stats. To upgrade, press the Upgrade Units button next to Battle Reports and choose a unit to upgrade.",
      icon: "/img/icons/addicon.png",
      tooltip: "Upgraded a unit",
    },
  ],
  [
    EObjectives.TrainAnvilDrones,
    {
      category: "Unit Production",
      type: "Train",
      requiredObjectives: [EObjectives.UpgradeUnit],
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
      category: "Unit Production",
      type: "Train",
      requiredObjectives: [EObjectives.TrainAnvilDrones],
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
      category: "Unit Production",
      type: "Train",
      unitType: EntityType.AegisDrone,
      requiredObjectives: [EObjectives.TrainHammerDrones],
      unitCount: 16n,
      requiredMainBase: 2n,
      description:
        "Upgrade the drone factory you placed on the map to Level 2 to unlock the ability to build Aegis drones. Aegis drones are strong but slow defensive units and take up more housing.",
    },
  ],
  [
    EObjectives.TrainStingerDrones,
    {
      category: "Unit Production",
      type: "Train",
      requiredObjectives: [EObjectives.TrainAegisDrones],
      unitType: EntityType.StingerDrone,
      unitCount: 16n,
      requiredMainBase: 2n,
      description:
        "Upgrade the drone factory you placed on the map to Level 3 to unlock the ability to build Stinger drones. Stinger drones are strong but slow offensive units and take up more housing.",
    },
  ],

  /* --------------------- A-A-B-B Unit Storage --------------------- */
  [
    EObjectives.BuildHangar,
    {
      category: "Unit Production",
      type: "Build",
      requiredObjectives: [EObjectives.TrainLightningCrafts],
      buildingType: EntityType.Hangar,
      requiredMainBase: 2n,
      description:
        "Hangars provide large amounts of housing for units. To build, select the hangar from the building menu and place it on an empty tile.",
    },
  ],

  /* ------------------------------ A-A-D Defense ----------------------------- */
  [
    EObjectives.BuildSAMLauncher,
    {
      category: "Defense",
      type: "Build",
      requiredObjectives: [EObjectives.CreateFleet],
      buildingType: EntityType.SAMLauncher,
      requiredMainBase: 2n,
      description: "SAM sites protect you from enemy attacks and raids by providing defense.",
    },
  ],
  [
    EObjectives.BuildShieldGenerator,
    {
      category: "Defense",
      type: "Build",
      requiredObjectives: [EObjectives.BuildSAMLauncher],
      buildingType: EntityType.ShieldGenerator,
      requiredMainBase: 2n,
      description: "Shield generators boost your asteroid's defense.",
    },
  ],
  [
    EObjectives.BuildVault,
    {
      category: "Defense",
      type: "Build",
      requiredObjectives: [EObjectives.BuildShieldGenerator],
      buildingType: EntityType.Vault,
      requiredMainBase: 2n,
      description: "Vaults protect your resources from being raided.",
    },
  ],

  /* ----------------------------- A-B Production ----------------------------- */

  [
    EObjectives.BuildLithiumMine,
    {
      category: "Resource Production",
      type: "Build",
      requiredObjectives: [EObjectives.ExpandBase1],
      buildingType: EntityType.LithiumMine,
      requiredMainBase: 2n,

      description:
        "Lithium mines produce lithium. To build, select the lithium mine in the building menu. Place it on an ore tile.",
    },
  ],
  [
    EObjectives.BuildStorageUnit,
    {
      category: "Resource Production",
      type: "Build",
      requiredObjectives: [EObjectives.BuildLithiumMine],
      buildingType: EntityType.StorageUnit,
      requiredMainBase: 2n,
      description:
        "Storage units increase your resource storage. To build, select the Storage Unit from the building menu and place it on any empty tile.",
    },
  ],

  /* ------------------------ A-B-A Production ----------------------- */

  [
    EObjectives.BuildPVCellFactory,
    {
      category: "Resource Production",
      type: "Build",
      requiredObjectives: [EObjectives.BuildStorageUnit],
      buildingType: EntityType.PVCellFactory,
      requiredMainBase: 2n,
      description:
        "The PV Cell factory produces photovoltaic cells by burning lithium. To build, select the PV Cell factory on the building menu and place it on any empty tile.",
    },
  ],

  [
    EObjectives.BuildSolarPanel,
    {
      category: "Resource Production",
      type: "Build",
      requiredObjectives: [EObjectives.BuildPVCellFactory],
      buildingType: EntityType.SolarPanel,
      requiredMainBase: 2n,
      description:
        "Solar panels provide electricity, which is used for advanced buildings. To build, select the solar panel from the building menu and place it on any empty tile.",
    },
  ],

  /* ------------------------------ A-B-B Market ------------------------------ */

  [
    EObjectives.BuildMarket,
    {
      category: "Market",
      type: "Build",
      requiredObjectives: [EObjectives.BuildStorageUnit],
      buildingType: EntityType.Market,
      requiredMainBase: 2n,
      description: "Markets trade resources with other players. There is a tax on all trades.",
    },
  ],

  [
    EObjectives.MarketSwap,
    {
      category: "Market",
      type: "Claim",
      requiredObjectives: [EObjectives.BuildMarket],
      description:
        "Swapping resources on the market allows you to get resources you need. To swap, select the Market and press the Swap button.",
      icon: "/img/icons/tradeicon.png",
      tooltip: "Executed a swap",
    },
  ],

  /* ------------------------------- A-C Alliance ------------------------------ */
  [
    EObjectives.JoinAlliance,
    {
      category: "Alliance",
      type: "JoinAlliance",

      requiredObjectives: [EObjectives.ExpandBase1],
      requiredMainBase: 2n,
      description:
        "Joining an alliance allows you to combine your points with other players. Press the Alliances button in the stack of buttons next to the Aura menu. Find an Alliance to join and press the Join button.",
    },
  ],
]);
