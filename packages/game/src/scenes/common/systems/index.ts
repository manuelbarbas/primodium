import { Core } from "@primodiumxyz/core";
import { InitResult } from "@game/init";
import { asteroidsLiveSystem } from "@game/scenes/common/systems/asteroidsLiveSystem";

export const runSystems = (api: Awaited<InitResult>, core: Core) => {
  asteroidsLiveSystem(api.STARMAP, api.COMMAND_CENTER, core);
};
