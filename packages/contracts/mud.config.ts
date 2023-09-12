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

  enums: {
    ERock: ["Null", "Asteroid", "Motherlode"],
    EBuilding: [
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
      schema: "uint32",
    },

    /* -------------------------------------------------------------------------- */
    /*                                   Player                                   */
    /* -------------------------------------------------------------------------- */
    Player: {
      keySchema: { entity: "bytes32" },
      schema: {
        spawned: "bool",
        homeAsteroid: "bytes32",
      },
    },
    /* -------------------------------------------------------------------------- */
    /*                                    Rocks                                   */
    /* -------------------------------------------------------------------------- */
    AsteroidCount: {
      keySchema: {},
      schema: "uint32",
    },

    RockType: {
      keySchema: { entity: "bytes32" },
      schema: "uint8",
    },

    /* -------------------------------------------------------------------------- */
    /*                                  Buildings                                 */
    /* -------------------------------------------------------------------------- */
    /* -------------------------------- Prototype ------------------------------- */

    P_Blueprint: {
      keySchema: { entity: "bytes32" },
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
