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
    Rock: ["Null", "Asteroid", "Motherlode"],
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
    GameConfig: {
      keySchema: {},
      schema: {
        spawnSpace: "uint32",
      },
    },

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
  },
});
