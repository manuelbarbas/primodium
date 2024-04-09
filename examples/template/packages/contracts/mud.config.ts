import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "YourNamespace",
  systems: {
    YourSystem: {
      name: "YourSystem",
      openAccess: true,
    },
  },
  tables: {},
});
