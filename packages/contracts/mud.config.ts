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
  tables: {
    Counter: {
      keySchema: {},
      schema: "uint32",
    },
  },
});
