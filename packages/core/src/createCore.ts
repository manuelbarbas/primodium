import { createComponents } from "@/components/createComponents";
import { createNetwork, network } from "@/network/createNetwork";
import { setupInitialSync } from "@/sync/setupInitialSync";
import { CoreConfig, Core } from "@/lib/types";
import { createUtils } from "@/utils/core";

export async function createCore(config: CoreConfig): Promise<Core> {
  const hot = network !== undefined;
  const networkResult = createNetwork(config);
  const components = createComponents(networkResult);
  const utils = createUtils(components);
  const core = {
    config,
    network: networkResult,
    components,
    utils,
  };

  if (!hot) setupInitialSync(core);

  return core;
}
