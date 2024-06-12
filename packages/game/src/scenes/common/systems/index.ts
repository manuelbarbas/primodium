import { InitResult } from "init";
import { asteroidsLiveSystem } from "@/scenes/common/systems/asteroidsLiveSystem";

export const runSystems = (api: Awaited<InitResult>) => {
  asteroidsLiveSystem(api.STARMAP, api.COMMAND_CENTER);
};
