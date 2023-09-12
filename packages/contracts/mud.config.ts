import { mudConfig } from "@latticexyz/world/register";

// Exclude dev systems if not in dev PRI_DEV
let dev: string[] = [];
if (typeof process != undefined && typeof process != "undefined") {
  import("dotenv").then((dotenv) => {
    dotenv.config({ path: "../../.env" });
    dev = process.env.PRI_DEV === "true" ? [] : ["DevSystem"];
  });
}

export default mudConfig({
  excludeSystems: [...dev],

  structs: {},
  enums: {
    ERock: ["NULL", "Asteroid", "Motherlode", "LENGTH"],
    EBuilding: [
      "NULL",
      // Special
      "MainBase",
      "StarMapper",
      "StorageUnit",
      "DroneFactory",

      // Mines
      "LithiumMine",
      "IronMine",
      "CopperMine",
      "TitaniumMine",
      "IridiumMine",
      "OsmiumMine",
      "TungstenMine",
      "KimberliteMine",
      "UraniniteMine",
      "BolutiteMine",
      "SulfurMine",

      // Factories
      "IronPlateFactory",
      "AlloyFactory",
      "PVCellFactory",
      "RocketFuelFactory",

      // Utilities
      "SolarPanel",
      "Hangar",
      "LENGTH",
    ],
  },
  tables: {
    /* -------------------------------------------------------------------------- */
    /*                                     Dev                                    */
    /* -------------------------------------------------------------------------- */
    Counter: {
      keySchema: {},
      schema: "uint32",
    },

    /* -------------------------------------------------------------------------- */
    /*                                   Common                                   */
    /* -------------------------------------------------------------------------- */

    Position: {
      keySchema: { entity: "bytes32" },
      schema: {
        x: "int32",
        y: "int32",
        parent: "bytes32",
      },
    },

    ReversePosition: {
      keySchema: { x: "int32", y: "int32" },
      schema: {
        entity: "bytes32",
      },
    },

    OwnedBy: {
      keySchema: { entity: "bytes32" },
      schema: {
        owner: "bytes32",
      },
    },

    Level: {
      keySchema: { entity: "bytes32" },
      schema: "uint32",
    },

    LastClaimedAt: {
      keySchema: { entity: "bytes32" },
      schema: "uint256",
    },

    /* -------------------------------------------------------------------------- */
    /*                                   Player                                   */
    /* -------------------------------------------------------------------------- */
    HomeAsteroid: {
      keySchema: { entity: "bytes32" },
      schema: {
        value: "bytes32",
      },
    },
    /* -------------------------------------------------------------------------- */
    /*                                    Rocks                                   */
    /* -------------------------------------------------------------------------- */
    P_Asteroid: {
      keySchema: {},
      schema: {
        xBounds: "int32",
        yBounds: "int32",
      },
    },
    AsteroidCount: {
      keySchema: {},
      schema: "uint32",
    },

    RockType: {
      keySchema: { entity: "bytes32" },
      schema: "uint8",
    },

    // note: dimensions will always be positive, but are int32s so they work with coords
    Dimensions: {
      keySchema: { key: "bytes32", level: "uint32" },
      schema: {
        x: "int32",
        y: "int32",
      },
    },

    Spawned: {
      keySchema: { entity: "bytes32" },
      schema: "bool",
    },

    /* -------------------------------------------------------------------------- */
    /*                                  Buildings                                 */
    /* -------------------------------------------------------------------------- */
    /* -------------------------------- Prototype ------------------------------- */

    P_Blueprint: {
      keySchema: { buildingType: "uint8" },
      schema: "int32[]",
    },

    P_MaxLevel: {
      keySchema: { entity: "bytes32" },
      schema: "uint32",
    },

    P_RequiredTile: {
      keySchema: { entity: "bytes32" },
      schema: "bytes32",
    },

    /* -------------------------------- Instance -------------------------------- */

    BuildingType: {
      keySchema: { entity: "bytes32" },
      schema: "uint8",
    },

    Children: {
      keySchema: { entity: "bytes32" },
      schema: "bytes32[]",
    },
  },
});
