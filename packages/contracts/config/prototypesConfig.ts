import { config } from "../mud.config";
import { PrototypesConfig } from "../ts/prototypes/prototypeConfig";
import { getBlueprint } from "./util/blueprints";

const prototypesConfig: PrototypesConfig<typeof config> = {
  /* ---------------------------------- World --------------------------------- */
  [""]: {
    tables: {
      P_Asteroid: { xBounds: 37, yBounds: 25 },
    },
  },
  MainBase: {
    tables: {
      Position: { x: 0, y: 0, parent: "0x0" },
      P_Blueprint: { value: getBlueprint(3, 2) },
      P_MaxLevel: { value: 8 },
    },
  },
};

export default prototypesConfig;
