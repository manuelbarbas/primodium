import { createComponents } from "@/components/createComponents";
import { createNetwork } from "@/network/createNetwork";
import { setupInitialSync } from "@/sync/setupInitialSync";
import { CoreConfig, Core } from "@/lib/types";
import { createUtils } from "@/utils/core";

export async function createCore(config: CoreConfig, skipSync = false): Promise<Core> {
  const networkResult = createNetwork(config);
  const components = createComponents(networkResult);
  const utils = createUtils(components);
  const core = {
    config,
    network: networkResult,
    components,
    utils,
  };

  if (!skipSync) setupInitialSync(core);

  return core;
}
