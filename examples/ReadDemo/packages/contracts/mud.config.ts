import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  namespace: "ReadDemo",
  systems: {
    ReadDemoSystem: {
      name: "ReadDemoSystem",
      openAccess: true,
    },
  },
  tables: {},
});
