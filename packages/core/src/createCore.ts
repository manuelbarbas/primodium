import { createComponents } from "@/components/createComponents";
import { createNetwork } from "@/network/createNetwork";
import { runInitialSync } from "@/sync/runInitialSync";
import { CoreConfig, Core } from "@/lib/types";
import { createUtils } from "@/utils/core";
import { createSync } from "@/sync";
import { runCoreSystems } from "@/systems";

export function createCore(config: CoreConfig): Core {
  const networkResult = createNetwork(config);
  const components = createComponents(networkResult);
  const utils = createUtils(components);
  const sync = createSync(config, networkResult, components);

  const core = {
    config,
    network: networkResult,
    components,
    utils,
    sync,
  };

  if (config?.runSync) runInitialSync(core, core.config.playerAddress);
  if (config?.runSystems) runCoreSystems(core);

  return core;
}
