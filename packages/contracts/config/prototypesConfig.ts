import { config } from "../mud.config";
import { PrototypesConfig } from "../ts/prototypes/types";
import { MUDEnums } from "./enums";
import { getBlueprint } from "./util/blueprints";
import encodeBytes32 from "./util/encodeBytes32";

const buildingIdToPrototypeId = MUDEnums.EBuilding.map((building, i) => ({
  [i]: {
    P_BuildingTypeToPrototype: { value: encodeBytes32(building) },
  },
})).reduce((acc, curr) => ({ ...acc, ...curr }), {});

const maxRange = { xBounds: 37, yBounds: 25 };
export const prototypesConfig: PrototypesConfig<typeof config> = {
  /* ---------------------------------- World --------------------------------- */
  World: {
    tables: {
      P_Asteroid: maxRange,
    },
    levels: buildingIdToPrototypeId,
  },

  Expansion: {
    tables: {
      P_MaxLevel: { value: 6 },
    },
    levels: {
      1: { Dimensions: { x: 13, y: 11 }, P_RequiredBaseLevel: { value: 1 } },
      2: { Dimensions: { x: 17, y: 13 }, P_RequiredBaseLevel: { value: 2 } },
      3: { Dimensions: { x: 21, y: 15 }, P_RequiredBaseLevel: { value: 3 } },
      4: { Dimensions: { x: 25, y: 17 }, P_RequiredBaseLevel: { value: 4 } },
      5: { Dimensions: { x: 29, y: 19 }, P_RequiredBaseLevel: { value: 5 } },
      6: { Dimensions: { x: 33, y: 13 }, P_RequiredBaseLevel: { value: 6 } },
      7: { Dimensions: { x: maxRange.xBounds, y: maxRange.yBounds }, P_RequiredBaseLevel: { value: 7 } },
    },
  },

  /* -------------------------------- Buildings ------------------------------- 
   NOTE the key of a building prototype must match its EBuilding enum equivalent
   This is because we use the enum to look up the prototype in the P_BuildingTypeToPrototype table
  ----------------------------------------------------------------------------- */

  MainBase: {
    tables: {
      Position: { x: Math.floor(maxRange.xBounds / 2), y: Math.floor(maxRange.yBounds / 2), parent: encodeBytes32(0) },
      P_Blueprint: { value: getBlueprint(3, 3) },
      P_MaxLevel: { value: 8 },
    },
  },

  // Mines
  IronMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 5 },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 1 } },
      2: { P_RequiredBaseLevel: { value: 1 } },
      3: { P_RequiredBaseLevel: { value: 3 } },
      4: { P_RequiredBaseLevel: { value: 5 } },
      5: { P_RequiredBaseLevel: { value: 8 } },
    },
  },
  CopperMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 5 },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 1 } },
      2: { P_RequiredBaseLevel: { value: 2 } },
      3: { P_RequiredBaseLevel: { value: 4 } },
      4: { P_RequiredBaseLevel: { value: 6 } },
      5: { P_RequiredBaseLevel: { value: 8 } },
    },
  },
  LithiumMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 5 },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 2 } },
      2: { P_RequiredBaseLevel: { value: 4 } },
      3: { P_RequiredBaseLevel: { value: 6 } },
      4: { P_RequiredBaseLevel: { value: 7 } },
      5: { P_RequiredBaseLevel: { value: 8 } },
    },
  },
  SulfurMine: {
    tables: {
      P_Blueprint: { value: getBlueprint(1, 1) },
      P_MaxLevel: { value: 5 },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 2 } },
      2: { P_RequiredBaseLevel: { value: 4 } },
      3: { P_RequiredBaseLevel: { value: 6 } },
      4: { P_RequiredBaseLevel: { value: 7 } },
      5: { P_RequiredBaseLevel: { value: 8 } },
    },
  },

  // Factories
  IronPlateFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 5 },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 1 } },
      2: { P_RequiredBaseLevel: { value: 3 } },
      3: { P_RequiredBaseLevel: { value: 5 } },
      4: { P_RequiredBaseLevel: { value: 7 } },
      5: { P_RequiredBaseLevel: { value: 8 } },
    },
  },
  AlloyFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 3 },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 3 } },
      2: { P_RequiredBaseLevel: { value: 6 } },
      3: { P_RequiredBaseLevel: { value: 8 } },
    },
  },
  PVCellFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 3 },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 2 } },
      2: { P_RequiredBaseLevel: { value: 5 } },
      3: { P_RequiredBaseLevel: { value: 8 } },
    },
  },

  // Utilities
  StorageUnit: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 3 },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 2 } },
      2: { P_RequiredBaseLevel: { value: 4 } },
      3: { P_RequiredBaseLevel: { value: 6 } },
    },
  },
  SolarPanel: {
    tables: {
      P_Blueprint: { value: getBlueprint(2, 2) },
      P_MaxLevel: { value: 3 },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 2 } },
      2: { P_RequiredBaseLevel: { value: 4 } },
      3: { P_RequiredBaseLevel: { value: 6 } },
    },
  },

  // Units
  Hangar: {
    tables: {
      P_Blueprint: { value: getBlueprint(4, 4) },
      P_MaxLevel: { value: 5 },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 2 } },
      2: { P_RequiredBaseLevel: { value: 4 } },
      3: { P_RequiredBaseLevel: { value: 6 } },
      4: { P_RequiredBaseLevel: { value: 7 } },
      5: { P_RequiredBaseLevel: { value: 8 } },
    },
  },
  DroneFactory: {
    tables: {
      P_Blueprint: { value: getBlueprint(3, 3) },
      P_MaxLevel: { value: 4 },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 2 } },
      2: { P_RequiredBaseLevel: { value: 4 } },
      3: { P_RequiredBaseLevel: { value: 6 } },
      4: { P_RequiredBaseLevel: { value: 8 } },
    },
  },
  Starmapper: {
    tables: {
      P_Blueprint: { value: getBlueprint(3, 2) },
      P_MaxLevel: { value: 3 },
    },
    levels: {
      1: { P_RequiredBaseLevel: { value: 3 } },
      2: { P_RequiredBaseLevel: { value: 7 } },
      3: { P_RequiredBaseLevel: { value: 8 } },
    },
  },
};
