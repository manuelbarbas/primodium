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
    EObjectives.BuildSulfurMine,
    "Select the sulfur mine on the building menu below and place it on the sulfur ore tile. Sulfur mines produce sulfur.",
  ],
  [
    EObjectives.BuildIronPlateFactory,
    "Select the plating factory on the building menu and place it on an empty tile. It produces iron plates by consuming iron production.",
  ],
  [
    EObjectives.BuildPVCellFactory,
    "Select the photovoltaic cell factory on the building menu and place it on an empty tile. It produces photovoltaic cells by consuming copper and lithium production.",
  ],
  [
    EObjectives.BuildGarage,
    "Select the garage from the building menu and place it on an empty tile. Garages provide housing for units. ",
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
    "Select the drone factory from the building menu and place it on an empty tile. Drone factories train drones, which travel faster and are stronger.",
  ],
  // [
  //   EObjectives.BuildHangar,
  //   "Select the hangar from the building menu and place it on an empty tile. Hangars provide more housing than garages for units.",
  // ],
  [
    EObjectives.TrainMinutemanMarine1,
    "Select the workshop you placed on the map to train Minuteman marines. Minutemen are basic defensive marines.",
  ],
  [
    EObjectives.TrainMinutemanMarine2,
    "Select the workshop you placed on the map to train Minuteman marines. Minutemen are basic defensive marines.",
  ],
  [
    EObjectives.TrainMinutemanMarine3,
    "Select the workshop you placed on the map to train Minuteman marines. Minutemen are basic defensive marines.",
  ],

  [
    EObjectives.TrainTridentMarine1,
    "Select the workshop you placed on the map to train Trident marines. Trident marines are basic offensive units.",
  ],
  [
    EObjectives.TrainTridentMarine2,
    "Select the workshop you placed on the map to train Trident marines. Trident marines are basic offensive units.",
  ],
  [
    EObjectives.TrainTridentMarine3,
    "Select the workshop you placed on the map to train Trident marines. Trident marines are basic offensive units.",
  ],
  [
    EObjectives.TrainAnvilDrone1,
    "Select the drone factory you placed on the map to train anvil drones. Anvil drones are basic defensive drones.",
  ],
  [
    EObjectives.TrainAnvilDrone2,
    "Select the drone factory you placed on the map to train anvil drones. Anvil drones are basic defensive drones.",
  ],
  [
    EObjectives.TrainAnvilDrone3,
    "Select the drone factory you placed on the map to train anvil drones. Anvil drones are basic defensive drones.",
  ],
  [
    EObjectives.DefeatPirateBase1,
    "Select the starmap on the top of your screen, then choose the red tinted pirate asteroid and send units to attack and raid.",
  ],
  [
    EObjectives.DefeatPirateBase2,
    "Select the starmap on the top of your screen, then choose the red tinted pirate asteroid and send units to attack and raid.",
  ],
  [
    EObjectives.DefeatPirateBase3,
    "Select the starmap on the top of your screen, then choose the red tinted pirate asteroid and send units to attack and raid.",
  ],
  [
    EObjectives.DefeatPirateBase4,
    "Select the starmap on the top of your screen, then choose the red tinted pirate asteroid and send units to attack and raid.",
  ],
  [
    EObjectives.DefeatPirateBase5,
    "Select the starmap on the top of your screen, then choose the red tinted pirate asteroid and send units to attack and raid.",
  ],
  [
    EObjectives.ExpandBase1,
    "Select your main base and click on Expand base to expand your buildable zone and uncover more resource ores.",
  ],
  [
    EObjectives.ExpandBase2,
    "Select your main base and click on Expand base to expand your buildable zone and uncover more resource ores.",
  ],
  [
    EObjectives.ExpandBase3,
    "Select your main base and click on Expand base to expand your buildable zone and uncover more resource ores.",
  ],
  [
    EObjectives.ExpandBase4,
    "Select your main base and click on Expand base to expand your buildable zone and uncover more resource ores.",
  ],
  [
    EObjectives.ExpandBase5,
    "Select your main base and click on Expand base to expand your buildable zone and uncover more resource ores.",
  ],
  [
    EObjectives.ExpandBase6,
    "Select your main base and click on Expand base to expand your buildable zone and uncover more resource ores.",
  ],
  [
    EObjectives.MineTitanium1,
    "Go to the star map and send a mining vessel along with a few defending units to a Titanium motherlode. ",
  ],
  [
    EObjectives.MineTitanium2,
    "Go to the star map and send a mining vessel along with a few defending units to a Titanium motherlode. ",
  ],
  [
    EObjectives.MineTitanium3,
    "Go to the star map and send a mining vessel along with a few defending units to a Titanium motherlode. ",
  ],

  [
    EObjectives.MinePlatinum1,
    "Go to the star map and send a mining vessel along with a few defending units to a Platinum motherlode. ",
  ],
  [
    EObjectives.MinePlatinum2,
    "Go to the star map and send a mining vessel along with a few defending units to a Platinum motherlode. ",
  ],
  [
    EObjectives.MinePlatinum3,
    "Go to the star map and send a mining vessel along with a few defending units to a Platinum motherlode. ",
  ],

  [
    EObjectives.MineIridium1,
    "Go to the star map and send a mining vessel along with a few defending units to a Iridium motherlode. ",
  ],
  [
    EObjectives.MineIridium2,
    "Go to the star map and send a mining vessel along with a few defending units to a Iridium motherlode. ",
  ],
  [
    EObjectives.MineIridium3,
    "Go to the star map and send a mining vessel along with a few defending units to a Iridium motherlode. ",
  ],

  [
    EObjectives.MineKimberlite1,
    "Go to the star map and send a mining vessel along with a few defending units to a Kimberlite motherlode. ",
  ],
  [
    EObjectives.MineKimberlite2,
    "Go to the star map and send a mining vessel along with a few defending units to a Kimberlite motherlode. ",
  ],
  [
    EObjectives.MineKimberlite3,
    "Go to the star map and send a mining vessel along with a few defending units to a Kimberlite motherlode. ",
  ],

  [
    EObjectives.TrainHammerDrone1,
    "Select the drone factory you placed on the map to train hammer drones. Hammer drones are used for attacking.",
  ],
  [
    EObjectives.TrainHammerDrone2,
    "Select the drone factory you placed on the map to train hammer drones. Hammer drones are used for attacking.",
  ],
  [
    EObjectives.TrainHammerDrone3,
    "Select the drone factory you placed on the map to train hammer drones. Hammer drones are used for attacking.",
  ],

  [
    EObjectives.TrainAegisDrone2,
    "Select the drone factory you placed on the map to train aegis drones. Aegis drones are strong defensive units, but take up more housing.",
  ],
  [
    EObjectives.TrainAegisDrone2,
    "Select the drone factory you placed on the map to train aegis drones. Aegis drones are strong defensive units, but take up more housing.",
  ],
  [
    EObjectives.TrainAegisDrone3,
    "Select the drone factory you placed on the map to train aegis drones. Aegis drones are strong defensive units, but take up more housing.",
  ],

  [
    EObjectives.TrainStingerDrone1,
    "Select the drone factory you placed on the map to train aegis drones. Stinger drones are strong and fast offensive units, but take up more housing.",
  ],
  [
    EObjectives.TrainStingerDrone2,
    "Select the drone factory you placed on the map to train aegis drones. Stinger drones are strong and fast offensive units, but take up more housing.",
  ],
  [
    EObjectives.TrainStingerDrone3,
    "Select the drone factory you placed on the map to train aegis drones. Stinger drones are strong and fast offensive units, but take up more housing.",
  ],

  [EObjectives.UpgradeMainBase, "Upgrade your main base by clicking on the upgrade button in your main base."],

  [
    EObjectives.CommissionMiningVessel,
    "Commission one mining vessel at your main base by first adding a slot and then building one mining vessel.",
  ],

  [
    EObjectives.BuildStarmapper,
    "Construct a starmapper station. A starmapper station increases the number of fleets you can send at a time.",
  ],

  [
    EObjectives.BuildSAMLauncher,
    "Construct a SAM site. SAM sites protect you from enemy attacks and raids by providing a base level of defense.",
  ],
  [
    EObjectives.RaidRawResources1,
    "Attack player asteroids and pirate bases and reap the raided rewards. Your total raid is the sum of your units cargo capacity.",
  ],
  [
    EObjectives.RaidRawResources2,
    "Attack player asteroids and pirate bases and reap the raided rewards. Your total raid is the sum of your units cargo capacity.",
  ],
  [
    EObjectives.RaidRawResources3,
    "Attack player asteroids and pirate bases and reap the raided rewards. Your total raid is the sum of your units cargo capacity.",
  ],

  [
    EObjectives.RaidFactoryResources1,
    "Attack player asteroids and pirate bases and reap the raided rewards. Your total raid is the sum of your units cargo capacity.",
  ],
  [
    EObjectives.RaidFactoryResources2,
    "Attack player asteroids and pirate bases and reap the raided rewards. Your total raid is the sum of your units cargo capacity.",
  ],
  [
    EObjectives.RaidFactoryResources3,
    "Attack player asteroids and pirate bases and reap the raided rewards. Your total raid is the sum of your units cargo capacity.",
  ],

  [
    EObjectives.RaidMotherlodeResources1,
    "Attack player asteroids and pirate bases and reap the raided rewards. Your total raid is the sum of your units cargo capacity.",
  ],
  [
    EObjectives.RaidMotherlodeResources2,
    "Attack player asteroids and pirate bases and reap the raided rewards. Your total raid is the sum of your units cargo capacity.",
  ],
  [
    EObjectives.RaidMotherlodeResources3,
    "Attack player asteroids and pirate bases and reap the raided rewards. Your total raid is the sum of your units cargo capacity.",
  ],
  [EObjectives.DestroyEnemyUnits1, "Attack and defend against enemy units and destroy your enemies' armies."],
  [EObjectives.DestroyEnemyUnits2, "Attack and defend against enemy units and destroy your enemies' armies."],
  [EObjectives.DestroyEnemyUnits3, "Attack and defend against enemy units and destroy your enemies' armies."],
  [EObjectives.DestroyEnemyUnits4, "Attack and defend against enemy units and destroy your enemies' armies."],
  [EObjectives.DestroyEnemyUnits5, "Attack and defend against enemy units and destroy your enemies' armies."],
]);
