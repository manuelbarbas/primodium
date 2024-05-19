import { Entity } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
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
    EObjectives.JoinDiscord,
    {
      category: "Social",
      type: "Claim",
      description:
        "Join the Primodium Discord by clicking on the button in the lower left. This is the most important decision you will ever make.",
      tooltip: "Joined Primodium on Discord",
      icon: InterfaceIcons.Discord,
    },
  ],
  [
    EObjectives.FollowTwitter,
    {
      category: "Social",
      type: "Claim",
      description:
        "Follow the Primodium Twitter by clicking on the button in the lower left. This is tied for the most important decision you will ever make.",
      icon: InterfaceIcons.Twitter,
      tooltip: "Followed Primodium on Twitter",
    },
  ],

  /*//////////////////////////////////////////////////////////////
                          Build Mines
  //////////////////////////////////////////////////////////////*/
  [
    EObjectives.BuildIronMine,
    {
      category: "Fundamentals",
      type: "Build",
      buildingType: EntityType.IronMine,
      description:
        "Iron mines produce iron, which is essential to building a strong empire. To build, select the iron mine from the Blueprints menu. Place it on a rainbow ore tile.",
    },
  ],
  [
    EObjectives.BuildCopperMine,
    {
      category: "Fundamentals",
      type: "Build",
      buildingType: EntityType.CopperMine,
      description:
        "Copper mines produce copper, which is a critical basic resource. To build, select the copper mine on the Blueprints menu. Place it on a rainbow ore tile.",
    },
  ],
  [
    EObjectives.BuildLithiumMine,
    {
      category: "Fundamentals",
      type: "Build",
      buildingType: EntityType.LithiumMine,
      description:
        "Lithium mines produce lithium, which is used to build advanced buildings. To build, select the lithium mine in the Blueprints menu. Place it on an ore tile.",
    },
  ],

  /*//////////////////////////////////////////////////////////////
                          Main Base
  //////////////////////////////////////////////////////////////*/
  [
    EObjectives.UpgradeMainBase2,
    {
      category: "Fundamentals",
      type: "Upgrade",
      buildingType: EntityType.MainBase,
      level: 2n,
      description:
        "Upgrading a main base grants you more resource storage and makes your asteroid stronger. To upgrade, click on your main base and select Upgrade.",
    },
  ],
  [
    EObjectives.UpgradeMainBase3,
    {
      category: "Fundamentals",
      type: "Upgrade",
      requiredObjectives: [EObjectives.CreateFleet],
      requiredMainBase: 2n,
      buildingType: EntityType.MainBase,
      level: 3n,
      description:
        "Upgrading a main base gives you more resource storage and makes your asteroid stronger. To upgrade, click on your main base and select Upgrade.",
    },
  ],
  [
    EObjectives.UpgradeMainBase4,
    {
      category: "Fundamentals",
      type: "Upgrade",
      requiredObjectives: [EObjectives.UpgradeMainBase3],
      requiredMainBase: 3n,
      buildingType: EntityType.MainBase,
      level: 4n,
      description:
        "Upgrading a main base gives you more resource storage and makes your asteroid stronger. To upgrade, click on your main base and select Upgrade.",
    },
  ],
  [
    EObjectives.UpgradeMainBase5,
    {
      category: "Fundamentals",
      type: "Upgrade",
      requiredObjectives: [EObjectives.BuildSolarPanel],
      requiredMainBase: 4n,
      buildingType: EntityType.MainBase,
      level: 5n,
      description:
        "Upgrading a main base gives you more resource storage and makes your asteroid stronger. To upgrade, click on your main base and select Upgrade.",
    },
  ],

  /*//////////////////////////////////////////////////////////////
                          Expand Base
  //////////////////////////////////////////////////////////////*/
  [
    EObjectives.ExpandBase2,
    {
      category: "Fundamentals",
      type: "Expand",
      requiredObjectives: [EObjectives.UpgradeMainBase2],
      requiredMainBase: 2n,
      level: 2n,
      description:
        "Expansion gives you more room to build and unlocks new ore tiles. To Expand, click on your main base and select Expand Base.",
    },
  ],
  [
    EObjectives.ExpandBase3,
    {
      category: "Fundamentals",
      type: "Expand",
      requiredObjectives: [EObjectives.UpgradeMainBase3],
      requiredMainBase: 3n,
      level: 3n,
      description:
        "Expansion gives you more room to build and unlocks new ore tiles. To Expand, click on your main base and select Expand Base.",
    },
  ],
  [
    EObjectives.ExpandBase4,
    {
      category: "Fundamentals",
      type: "Expand",
      requiredObjectives: [EObjectives.UpgradeMainBase5],
      requiredMainBase: 5n,
      level: 4n,
      description:
        "Expansion gives you more room to build and unlocks new ore tiles. To Expand, click on your main base and select Expand Base.",
    },
  ],

  /*//////////////////////////////////////////////////////////////
                          Upgrade Mines
  //////////////////////////////////////////////////////////////*/
  [
    EObjectives.UpgradeIronMine2,
    {
      category: "Fundamentals",
      type: "Upgrade",
      requiredObjectives: [EObjectives.BuildIronMine, EObjectives.OpenBattleReport],
      requiredMainBase: 2n,
      buildingType: EntityType.IronMine,
      level: 2n,
      description:
        "Upgrading an iron mine produces iron at a faster rate. To upgrade, click on an iron mine and select Upgrade.",
    },
  ],
  [
    EObjectives.UpgradeIronMine3,
    {
      category: "Fundamentals",
      type: "Upgrade",
      requiredObjectives: [EObjectives.UpgradeIronMine2, EObjectives.UpgradeMainBase3],
      requiredMainBase: 3n,
      buildingType: EntityType.IronMine,
      level: 3n,
      description:
        "Upgrading an iron mine produces iron at a faster rate. To upgrade, click on an iron mine and select Upgrade.",
    },
  ],

  [
    EObjectives.UpgradeCopperMine2,
    {
      category: "Fundamentals",
      type: "Upgrade",
      requiredObjectives: [EObjectives.BuildCopperMine, EObjectives.OpenBattleReport],
      requiredMainBase: 2n,
      buildingType: EntityType.CopperMine,
      level: 2n,
      description:
        "Upgrading a copper mine produces copper at a faster rate. To upgrade, click on a copper mine and select Upgrade.",
    },
  ],
  [
    EObjectives.UpgradeCopperMine3,
    {
      category: "Fundamentals",
      type: "Upgrade",
      requiredObjectives: [EObjectives.UpgradeCopperMine2, EObjectives.UpgradeMainBase3],
      requiredMainBase: 3n,
      buildingType: EntityType.CopperMine,
      level: 3n,
      description:
        "Upgrading a copper mine produces copper at a faster rate. To upgrade, click on a copper mine and select Upgrade.",
    },
  ],

  [
    EObjectives.UpgradeLithiumMine2,
    {
      category: "Fundamentals",
      type: "Upgrade",
      requiredObjectives: [EObjectives.BuildLithiumMine, EObjectives.OpenBattleReport],
      requiredMainBase: 2n,
      buildingType: EntityType.LithiumMine,
      level: 2n,
      description:
        "Upgrading a lithium mine produces lithium at a faster rate. To upgrade, click on a lithium mine and select Upgrade.",
    },
  ],
  [
    EObjectives.UpgradeLithiumMine3,
    {
      category: "Fundamentals",
      type: "Upgrade",
      requiredObjectives: [EObjectives.UpgradeLithiumMine2, EObjectives.UpgradeMainBase3],
      requiredMainBase: 3n,
      buildingType: EntityType.LithiumMine,
      level: 3n,
      description:
        "Upgrading a lithium mine produces lithium at a faster rate. To upgrade, click on a lithium mine and select Upgrade.",
    },
  ],

  /* ----------------------------- A-A Military Basics ---------------------------- */
  [
    EObjectives.BuildGarage,
    {
      category: "Unit Production",
      type: "Build",
      requiredMainBase: 2n,
      requiredObjectives: [EObjectives.BuildWorkshop],
      buildingType: EntityType.Garage,
      description:
        "Garages provide housing for military units. To build, select the garage from the Storage tab of the Blueprints menu. Place it on any empty tile. View your asteroid's new housing in the Resources pane.",
    },
  ],
  [
    EObjectives.UpgradeGarage,
    {
      category: "Unit Production",
      type: "Upgrade",
      requiredMainBase: 2n,
      requiredObjectives: [EObjectives.BuildGarage],
      buildingType: EntityType.Garage,
      level: 2n,
      description:
        "Upgrading a garage increases your asteroid's available housing. To upgrade, click on a garage and select Upgrade.",
    },
  ],
  [
    EObjectives.BuildWorkshop,
    {
      category: "Unit Production",
      type: "Build",
      requiredMainBase: 2n,
      requiredObjectives: [EObjectives.UpgradeMainBase2],
      buildingType: EntityType.Workshop,
      description:
        "Workshops train Marines, which are basic units. To build, select the workshop from the Military tab of the Blueprints menu and place it on any empty tile.",
    },
  ],
  [
    EObjectives.UpgradeWorkshop,
    {
      category: "Unit Production",
      type: "Upgrade",
      requiredMainBase: 2n,
      requiredObjectives: [EObjectives.UpgradeGarage],
      buildingType: EntityType.Workshop,
      level: 2n,
      description:
        "Upgrading a workshop produces units more quickly and might unlock new units. To upgrade, click on a workshop and select Upgrade.",
    },
  ],

  /* ------------------------------ A-A-A Fleet ------------------------------ */
  [
    EObjectives.CreateFleet,
    {
      category: "Fleet",
      type: "Claim",
      requiredObjectives: [EObjectives.UpgradeGarage],
      description:
        'Fleets transport units and resources between asteroids. Create a fleet by entering the Command Center using the top bar. In the Command Center, select the Transfer Inventory button on the left side bar and click "Add Fleet".',
      icon: InterfaceIcons.Fleet,
      tooltip: "Created a fleet",
    },
  ],
  [
    EObjectives.TransferFromFleet,
    {
      category: "Fleet",
      type: "Claim",
      requiredObjectives: [EObjectives.CreateFleet],
      description:
        "Transfer from a fleet by entering the Command Center using the top bar. In the Command Center, select the Transfer Inventory button on the left side bar and transfer resources from a fleet you own.",
      icon: InterfaceIcons.Trade,
      tooltip: "Executed a transfer",
    },
  ],
  [
    EObjectives.TransferFromAsteroid,
    {
      category: "Fleet",
      type: "Claim",
      requiredObjectives: [EObjectives.TransferFromFleet],
      description:
        "Transfer from an asteroid by entering the Command Center using the top bar. In the Command Center, select the Transfer Inventory button on the left side bar and transfer resources from a fleet you own.",
      icon: InterfaceIcons.Trade,
      tooltip: "Executed a transfer",
    },
  ],

  [
    EObjectives.SendFleet,
    {
      category: "Fleet",
      type: "Claim",
      requiredObjectives: [EObjectives.TransferFromAsteroid],
      description:
        "Sending a fleet to an asteroid allows it to deposit resources and units or fight other fleets. To send, select a target asteroid and select Travel. Then select a fleet to travel.",
      icon: InterfaceIcons.Fleet,
      tooltip: "Executed a fleet send",
    },
  ],

  /* ------------------------------ A-A-A-A Fleet Combat ------------------------------ */
  [
    EObjectives.BattleAsteroid,
    {
      category: "Combat",
      type: "Claim",
      requiredObjectives: [EObjectives.SendFleet],
      // TODO @NAB5 explain how to attack in the command center
      description:
        "Battling an asteroid allows you to raid resources and conquer asteroids. To battle, go to the Command Center. Then select target asteroid and an attacker.",
      icon: InterfaceIcons.Attack,
      tooltip: "Executed an attack",
    },
  ],
  [
    EObjectives.OpenBattleReport,
    {
      category: "Combat",
      type: "Claim",
      requiredObjectives: [EObjectives.BattleAsteroid],
      description:
        "Open a battle report to see the results of a battle. To open, select Battle Reports in the bottom dock.",
      icon: InterfaceIcons.Reports,
      tooltip: "Viewed a battle report",
    },
  ],
  [
    EObjectives.BattleFleet,
    {
      category: "Combat",
      type: "Claim",
      requiredObjectives: [EObjectives.OpenBattleReport],
      description:
        "Battling a fleet allows you to raid resources and protect your asteroid. To battle, go to the Command Center. Then select target fleet and an attacker.",
      icon: InterfaceIcons.Attack,
      tooltip: "Executed an attack",
    },
  ],

  /* -------------------------- A-A-A-B Conquest (continued) ------------------------- */
  [
    EObjectives.BuildShipyard,
    {
      category: "Conquest",
      type: "Build",
      requiredMainBase: 8n,
      buildingType: EntityType.Shipyard,
      description:
        "Shipyards constuct Colony Ships, which colonize asteroids. To build a shipyard, go to the Blueprints menu and select military. Place a Shipyard on any open tile.",
    },
  ],
  [
    EObjectives.TrainColonyShip,
    {
      category: "Conquest",
      type: "Train",
      requiredMainBase: 8n,
      requiredObjectives: [EObjectives.BuildShipyard],
      unitType: EntityType.ColonyShip,
      unitCount: 1n,
      description:
        "To train a colony ship, click on Shipyard and select Commission. Unlock a Colony Ship slot by paying required resources and then commmission a ship. Fleets containing colony ships conquer asteroids.",
    },
  ],
  [
    EObjectives.DecryptAttack,
    {
      category: "Conquest",
      type: "Claim",
      requiredObjectives: [EObjectives.TrainColonyShip],
      description:
        " To decrypt an asteroid, attack it using a fleet containing a Colony Ship. Once an asteroid's decryption reaches zero, you can conquer it. An asteroid's decryption is marked by a Lock icon.",
      icon: InterfaceIcons.EncryptionBlue,
      tooltip: "Decrypted an asteroid",
    },
  ],
  [
    EObjectives.CaptureAsteroid,
    {
      category: "Conquest",
      type: "Asteroid",
      requiredObjectives: [EObjectives.DecryptAttack],
      asteroidType: "common",
      description:
        "Capturing an asteroid allows you to take control of it. To capture, reduce an asteroid's encryption to 0 by attacking with fleets containing Colony Ships.",
    },
  ],

  /* --------------------- A-A-A-B-A Motherlode Extraction -------------------- */
  [
    EObjectives.CaptureMotherlodeAsteroid,
    {
      category: "Motherlode",
      type: "Asteroid",
      asteroidType: "motherlode",
      requiredObjectives: [EObjectives.CaptureAsteroid],
      description:
        "Capturing motherlode asteroids lets you mine rare resources. To earn, capture a motherlode asteroid near your home asteroid.",
    },
  ],

  [
    EObjectives.BuildRareMine,
    {
      category: "Motherlode",
      type: "BuildAny",
      buildingTypes: [
        EntityType.KimberliteMine,
        EntityType.IridiumMine,
        EntityType.PlatinumMine,
        EntityType.TitaniumMine,
      ],
      requiredObjectives: [EObjectives.CaptureMotherlodeAsteroid],
      description:
        "To extract a rare resource, capture a motherlode asteroid and build a rare mine on its special ore tile.",
    },
  ],

  /* ------------------------ A-A-A-B-B Primodium Points ----------------------- */

  [
    EObjectives.EarnPrimodiumOnAsteroid,
    {
      category: "Victory (Shard)",
      type: "Claim",
      requiredObjectives: [EObjectives.CaptureAsteroid],
      description:
        "Earning Primodium allows you to win the game. To start earning, capture asteroids and hold them until you can claim their Primodium.",
      icon: InterfaceIcons.Leaderboard,
      tooltip: "Claimed Primodium",
    },
  ],
  [
    EObjectives.CaptureVolatileShard,
    {
      category: "Victory (Shard)",
      type: "Asteroid",
      asteroidType: "shard",
      requiredObjectives: [EObjectives.CaptureAsteroid],
      description:
        "Volatile Shards are rare space rocks that are made of Primodium. Over time, shards leach Primodium. To earn, capture a Shard while it is leaching Primodium.",
    },
  ],
  [
    EObjectives.ExplodeVolatileShard,
    {
      category: "Victory (Shard)",
      type: "Claim",
      requiredObjectives: [EObjectives.CaptureVolatileShard],
      description:
        "To explode a shard, select an owned shard when an explosion is imminent and select Explode. Be warned, the explosion kills all fleets in the area!",
      icon: InterfaceIcons.Asteroid,
      tooltip: "Exploded Shard",
    },
  ],
  /* ------------------------- A-A-A-B-C Extraction Points ------------------------ */

  [
    EObjectives.CaptureWormholeAsteroid,
    {
      category: "Victory (Wormhole)",
      type: "Asteroid",
      asteroidType: "wormhole",
      requiredObjectives: [EObjectives.CaptureAsteroid],
      description:
        "A wormhole asteroid is a special asteroid that lets you earn points on the Wormhole leaderboard by sending it certain resources. To capture, decrypt a nearby Wormhole Asteroid.",
    },
  ],
  [
    EObjectives.TeleportResources,
    {
      category: "Victory (Wormhole)",
      type: "Claim",
      requiredObjectives: [EObjectives.CaptureWormholeAsteroid],
      description:
        "Teleporting resources improves your rank on the Extraction leaderboard. To teleport, click on a Wormhole Generator and send it the resource it currently requires.",
      icon: InterfaceIcons.Leaderboard,
      tooltip: "Claimed extraction points",
    },
  ],
  /* ------------------------ A-A-A-C Fleet Management ------------------------ */

  [
    EObjectives.BuildStarmapper,
    {
      category: "Fleet",
      type: "Build",
      requiredMainBase: 3n,
      requiredObjectives: [EObjectives.UpgradeStorageUnit2],
      buildingType: EntityType.StarmapperStation,
      description: "A Starmapper Station increases the number of fleets you can create.",
    },
  ],
  [
    EObjectives.DefendWithFleet,
    {
      category: "Fleet",
      type: "Claim",
      requiredObjectives: [EObjectives.TransferFromAsteroid],
      description:
        "Defending an asteroid with a fleet bolsters that asteroid's strength. To defend, go to the fleet's Management pane in the Command Center and select Defend.",
      icon: InterfaceIcons.Fleet,
      tooltip: "Landed a fleet",
    },
  ],
  [
    EObjectives.BlockWithFleet,
    {
      category: "Fleet",
      type: "Claim",
      requiredObjectives: [EObjectives.DefendWithFleet],
      description:
        "Blocking an asteroid with a fleet prevents all fleets from leaving that asteroid. To block, go to the fleet's Management pane in the Command Center and select Block.",
      icon: InterfaceIcons.Fleet,
      tooltip: "Landed a fleet",
    },
  ],
  [
    EObjectives.LandFleet,
    {
      category: "Fleet",
      type: "Claim",
      requiredObjectives: [EObjectives.BlockWithFleet],
      description:
        "Landing a fleet on an asteroid sets the fleet's owner to that asteroid. It transfers all fleet resources and units. To land, select a fleet in the Command Center and select Land.",
      icon: InterfaceIcons.Fleet,
      tooltip: "Landed a fleet",
    },
  ],

  /* ----------------------- A-A-B Unit Production ---------------------- */
  [
    EObjectives.TrainMinutemanMarine,
    {
      category: "Unit Production",
      type: "Train",
      requiredMainBase: 2n,
      requiredObjectives: [EObjectives.UpgradeMainBase3],
      unitType: EntityType.MinutemanMarine,
      unitCount: 12n,
      description:
        "Minutemen are expendable offensive units that are trained quickly, move very fast, and provide an efficient cargo ability per housing required. To train, click on a workshop and select Train Units.",
    },
  ],
  [
    EObjectives.TrainTridentMarine,
    {
      category: "Unit Production",
      type: "Train",
      requiredMainBase: 8n,
      requiredObjectives: [EObjectives.TrainMinutemanMarine],
      unitType: EntityType.TridentMarine,
      unitCount: 12n,

      description:
        "Select the workshop you placed on the map to train Trident marines. Trident marines are well-rounded units with good speed and excellent cargo ability. To train, click on a workshop and select Train Units.",
    },
  ],
  [
    EObjectives.TrainLightningCraft,
    {
      category: "Unit Production",
      type: "Train",
      requiredMainBase: 10n,
      requiredObjectives: [EObjectives.TrainTridentMarine],
      unitType: EntityType.LightningCraft,
      unitCount: 5n,
      description:
        "Upgrade a workshop to Level 10 to unlock the ability to train Lightning Ships. Lightning Ships are weak, but are insanely fast, high cargo units.",
    },
  ],

  [
    EObjectives.BuildDroneFactory,
    {
      category: "Unit Production",
      type: "Build",
      requiredMainBase: 5n,
      buildingType: EntityType.DroneFactory,
      description:
        "Drone factories train drones, which are strong and specialized. To build, select the Drone Factory from the Blueprints menu and place it on any empty tile.",
    },
  ],
  [
    EObjectives.UpgradeDroneFactory2,
    {
      category: "Unit Production",
      type: "Upgrade",
      requiredObjectives: [EObjectives.BuildDroneFactory],
      buildingType: EntityType.DroneFactory,
      level: 2n,
      description:
        "Upgrading a Drone Factories produces units more quickly and might unlock new units. To upgrade, click on a Drone Factory and select Upgrade.",
    },
  ],

  /* --------------------- A-A-B-A Unit Management ---------------------------- */
  [
    EObjectives.UpgradeUnit,
    {
      category: "Unit Management",
      type: "Claim",
      requiredObjectives: [EObjectives.BuildDroneFactory],
      description:
        "Upgrading a unit increases its stats. To upgrade, select Upgrade in the Command Center left side bar.",
      icon: InterfaceIcons.Add,
      tooltip: "Upgraded a unit",
    },
  ],
  /* --------------------- A-A-B-B Unit Production (cont) --------------------- */
  [
    EObjectives.TrainAnvilDrone,
    {
      category: "Unit Production",
      type: "Train",
      requiredMainBase: 5n,
      requiredObjectives: [EObjectives.BuildDroneFactory],
      unitType: EntityType.AnvilDrone,
      unitCount: 20n,
      description:
        "To train an anvil drone, select a drone factory. Anvil drones are standard drones tuned to be a sturdy and reliable.",
    },
  ],
  [
    EObjectives.TrainHammerDrone,
    {
      category: "Unit Production",
      type: "Train",
      requiredMainBase: 5n,
      requiredObjectives: [EObjectives.BuildDroneFactory],
      unitType: EntityType.HammerDrone,
      unitCount: 20n,
      description:
        "To build a hammer drone, Click on a drone factory. Hammer drones are standard drones that sacrifice armor for more weapons.",
    },
  ],
  [
    EObjectives.TrainAegisDrone,
    {
      category: "Unit Production",
      type: "Train",
      requiredMainBase: 8n,
      unitType: EntityType.AegisDrone,
      requiredObjectives: [EObjectives.TrainAnvilDrone],
      unitCount: 20n,
      description:
        "Upgrade a drone factory to Level 8 to unlock the ability to build Aegis drones. Aegis drones are robust specialized defensive units. They occupy more housing than any other unit.",
    },
  ],
  [
    EObjectives.TrainStingerDrone,
    {
      category: "Unit Production",
      type: "Train",
      requiredMainBase: 8n,
      requiredObjectives: [EObjectives.TrainHammerDrone],
      unitType: EntityType.StingerDrone,
      unitCount: 20n,
      description:
        "Upgrade a drone factory to Level 8 to unlock the ability to build Stinger drones. Stinger drones are powerful specialized assault units. They occupy more housing than any other unit.",
    },
  ],

  /* --------------------- A-A-B-C Unit Storage --------------------- */
  [
    EObjectives.BuildHangar,
    {
      category: "Unit Storage",
      type: "Build",
      requiredMainBase: 5n,
      buildingType: EntityType.Hangar,
      description:
        "Hangars provide large amounts of space-efficient housing for units. To build, select the Hangar from the Blueprints menu and place it on an empty tile.",
    },
  ],
  [
    EObjectives.UpgradeHanger2,
    {
      category: "Unit Storage",
      type: "Upgrade",
      requiredObjectives: [EObjectives.BuildHangar],
      buildingType: EntityType.Hangar,
      level: 2n,
      description:
        "Upgrade Hangars to further increase space-efficient housing for units. To upgrade, click on a Hangar and select Upgrade.",
    },
  ],

  /* ------------------------------ A-A-C Defense ----------------------------- */
  [
    EObjectives.BuildShieldGenerator,
    {
      category: "Defense",
      type: "Build",
      requiredMainBase: 5n,
      buildingType: EntityType.ShieldGenerator,
      description:
        "Shield Generators boost defense provided by fleets and SAM launchers, and improve asteroid defense recovery. They are very power hungry. To build, select the Shield Generator from the Blueprints menu and place it on an empty tile.",
    },
  ],
  [
    EObjectives.UpgradeShieldGenerator2,
    {
      category: "Defense",
      type: "Upgrade",
      requiredObjectives: [EObjectives.BuildShieldGenerator],
      buildingType: EntityType.ShieldGenerator,
      level: 2n,
      description:
        "Upgrade Shield Generators to further increase defense boost and defense recovery. To upgrade, click on a Shield Generator and select Upgrade.",
    },
  ],
  [
    EObjectives.BuildVault,
    {
      category: "Defense",
      type: "Build",
      requiredMainBase: 7n,
      buildingType: EntityType.Vault,
      description:
        "Vaults automatically protect some of your resources from being raided. To build, select the Vault from the Blueprints menu and place it on an empty tile.",
    },
  ],
  [
    EObjectives.UpgradeVault2,
    {
      category: "Defense",
      type: "Upgrade",
      requiredObjectives: [EObjectives.BuildVault],
      buildingType: EntityType.Vault,
      level: 2n,
      description:
        "Upgrade Vaults to increase quantity and type of resources protected. To upgrade, click on a Vault and select Upgrade.",
    },
  ],
  [
    EObjectives.BuildSAMLauncher,
    {
      category: "Defense",
      type: "Build",
      requiredMainBase: 8n,
      buildingType: EntityType.SAMLauncher,
      description:
        "SAM launchers give your asteroid native defense and additional health, protecting you from enemy attacks. You need electricity to power them. To build, select the SAM Launcher from the Blueprints menu and place it on an empty tile.",
    },
  ],
  [
    EObjectives.UpgradeSAMLauncher2,
    {
      category: "Defense",
      type: "Upgrade",
      requiredObjectives: [EObjectives.BuildSAMLauncher],
      buildingType: EntityType.SAMLauncher,
      level: 2n,
      description:
        "Upgrade SAM launchers to further increase asteroid native defense and health. To upgrade, click on a SAM launcher and select Upgrade.",
    },
  ],

  /* ----------------------------- A-B Production ----------------------------- */
  [
    EObjectives.BuildStorageUnit,
    {
      category: "Resource Production",
      type: "Build",
      requiredMainBase: 3n,
      buildingType: EntityType.StorageUnit,
      description:
        "Storage units increase your resource storage. To build, select the Storage Unit from the Blueprints menu and place it on any empty tile.",
    },
  ],
  [
    EObjectives.UpgradeStorageUnit2,
    {
      category: "Resource Production",
      type: "Upgrade",
      requiredObjectives: [EObjectives.BuildStorageUnit],
      buildingType: EntityType.StorageUnit,
      level: 2n,
      description:
        "Upgrade a Storage Unit to increase the quantity and diversity of resources your asteroid can hold. To upgrade, click on a Storage Unit and select Upgrade.",
    },
  ],
  [
    EObjectives.BuildIronPlateFactory,
    {
      category: "Resource Production",
      type: "Build",
      requiredMainBase: 5n,
      requiredObjectives: [EObjectives.BuildIronMine],
      buildingType: EntityType.IronPlateFactory,
      description:
        "Iron Plate Factories produce iron plate by consuming iron. To build, select the Iron Plate factory in the Blueprints menu. Place it on any empty tile.",
    },
  ],
  [
    EObjectives.UpgradeIronPlateFactory2,
    {
      category: "Resource Production",
      type: "Upgrade",
      requiredObjectives: [EObjectives.BuildIronPlateFactory],
      buildingType: EntityType.IronPlateFactory,
      level: 2n,
      description:
        "Upgrade Iron Plate Factories to produce more iron plate by consuming more iron. To upgrade, click on an Iron Plate Factory and select Upgrade.",
    },
  ],
  [
    EObjectives.BuildAlloyFactory,
    {
      category: "Resource Production",
      type: "Build",
      requiredMainBase: 5n,
      requiredObjectives: [EObjectives.BuildCopperMine],
      buildingType: EntityType.AlloyFactory,
      description:
        "Alloy factories produce alloy by consuming copper. To build, select the Alloy factory in the Blueprints menu. Place it on any empty tile.",
    },
  ],
  [
    EObjectives.UpgradeAlloyFactory2,
    {
      category: "Resource Production",
      type: "Upgrade",
      requiredObjectives: [EObjectives.BuildAlloyFactory],
      buildingType: EntityType.AlloyFactory,
      level: 2n,
      description:
        "Upgrade Alloy Factories to produce more alloy by consuming more copper. To upgrade, click on an Alloy Factory and select Upgrade.",
    },
  ],
  [
    EObjectives.BuildPVCellFactory,
    {
      category: "Resource Production",
      type: "Build",
      requiredMainBase: 5n,
      requiredObjectives: [EObjectives.BuildLithiumMine],
      buildingType: EntityType.PVCellFactory,
      description:
        "The PV Cell factory produces photovoltaic cells by consuming lithium. To build, select the PV Cell factory in the Blueprints menu and place it on any empty tile.",
    },
  ],
  [
    EObjectives.UpgradePVCellFactory2,
    {
      category: "Resource Production",
      type: "Upgrade",
      requiredObjectives: [EObjectives.BuildPVCellFactory],
      buildingType: EntityType.PVCellFactory,
      level: 2n,
      description:
        "Upgrade PV Cell Factories to produce more pv cells by consuming more lithium. To upgrade, click on a PV Cell Factory and select Upgrade.",
    },
  ],

  /* ------------------------ A-B-A Production ----------------------- */

  [
    EObjectives.BuildSolarPanel,
    {
      category: "Resource Production",
      type: "Build",
      requiredMainBase: 4n,
      buildingType: EntityType.SolarPanel,
      description:
        "Solar panels provide electricity, which is used for advanced buildings. To build, select the Solar Panel from the Blueprints menu and place it on any empty tile.",
    },
  ],
  [
    EObjectives.UpgradeSolarPanel2,
    {
      category: "Resource Production",
      type: "Upgrade",
      requiredObjectives: [EObjectives.BuildSolarPanel],
      requiredMainBase: 4n,
      buildingType: EntityType.SolarPanel,
      level: 2n,
      description:
        "Solar panels provide electricity, which is used for advanced buildings. To upgrade, click on a Solar Panel and select Upgrade.",
    },
  ],

  /* ------------------------------ A-B-B Market ------------------------------ */

  [
    EObjectives.BuildMarket,
    {
      category: "Market",
      type: "Build",
      requiredMainBase: 6n,
      buildingType: EntityType.Market,
      description:
        "Markets grant access to the global resource marketplace. It's perfect for moments when you are missing a rare resource! To build, select the Solar Panel from the Blueprints menu and place it on any empty tile.",
    },
  ],

  [
    EObjectives.MarketSwap,
    {
      category: "Market",
      type: "Claim",
      requiredObjectives: [EObjectives.BuildMarket],
      description:
        "Swapping resources on the market allows you to get resources you need. To swap, select the Market and choose two resources to exchange. Then select Swap.",
      icon: InterfaceIcons.Trade,
      tooltip: "Executed a swap",
    },
  ],

  /* ------------------------------- A-C Alliance (Social) --------------------- */
  [
    EObjectives.JoinAlliance,
    {
      category: "Alliance",
      type: "JoinAlliance",
      requiredObjectives: [EObjectives.ExpandBase2],
      requiredMainBase: 2n,
      description:
        "Joining an alliance allows you to earn glory and the revered Champion badge (and maybe other prizes) with your friends. To join, Select Alliance Management in the bottom dock. Find an alliance to join and select Join.",
    },
  ],
]);
