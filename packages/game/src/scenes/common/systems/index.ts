import { Core } from "@primodiumxyz/core";
import { InitResult } from "@/init";
import { asteroidsLiveSystem } from "@/scenes/common/systems/asteroidsLiveSystem";

export const runSystems = (api: Awaited<InitResult>, core: Core) => {
  asteroidsLiveSystem(api.STARMAP, api.COMMAND_CENTER, core);
};
