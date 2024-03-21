import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  namespace: "PluginExamples",
  systems: {
    WriteDemoSystem: {
      name: "WriteDemoSystem",
      openAccess: true,
    },
  },
  tables: {},
});
