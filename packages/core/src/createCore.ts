import { createTables } from "@/tables/createTables";
import { createSyncTables } from "@/tables/syncTables";
import { createNetwork } from "@/network/createNetwork";
import { runInitialSync } from "@/sync/runInitialSync";
import { CoreConfig, Core } from "@/lib/types";
import { createUtils } from "@/utils/core";
import { createSync } from "@/sync";
import { runCoreSystems } from "@/systems";
import { createWorld } from "@primodiumxyz/reactive-tables";

/**
 *
 * @param config {@link CoreConfig}
 * @returns: {@link Core}
 */
export function createCore(config: CoreConfig): Core {
  const world = createWorld();
  const syncTables = createSyncTables(world);
  const networkResult = createNetwork(config, syncTables);
  const tables = createTables(networkResult, syncTables);
  const utils = createUtils(tables);
  const sync = createSync(config, networkResult, tables);

  const core = {
    config,
    network: networkResult,
    tables,
    utils,
    sync,
  };

  if (config?.runSystems && !config.runSync) throw new Error("Cannot run systems without running sync");
  if (config?.runSync) {
    runInitialSync(core, core.config.playerAddress).then(() => {
      if (config?.runSystems) runCoreSystems(core);
    });
  }

  return core;
}
