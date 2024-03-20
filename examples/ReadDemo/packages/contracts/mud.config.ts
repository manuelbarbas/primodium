import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  namespace: "PluginExamples",
  systems: {
    ReadDemoSystem: {
      name: "ReadDemoSystem",
      openAccess: true,
    },
  },
  tables: {},
});
