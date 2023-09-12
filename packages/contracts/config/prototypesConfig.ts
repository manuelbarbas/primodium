import { config } from "../mud.config";
import { PrototypesConfig } from "../ts/prototypes/prototypeConfig";
import { getBlueprint } from "./util/blueprints";

const prototypesConfig: PrototypesConfig<typeof config> = {
  MainBase: {
    tables: {
      P_Blueprint: { value: getBlueprint(3, 2) },
      P_MaxLevel: { value: 8 },
    },
  },
};

export default prototypesConfig;
