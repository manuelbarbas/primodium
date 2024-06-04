import { createComponents } from "@/components/createComponents";
import { createNetwork, network } from "@/network/createNetwork";
import { setupInitialSync } from "@/sync/setupInitialSync";
import { SetupResult } from "@/lib/types";
import { createUtils } from "@/utils/core";
import { Hex } from "viem";

export async function setup(playerAddress: Hex): Promise<SetupResult> {
  const hot = network !== undefined;
  const networkResult = createNetwork();
  const components = createComponents(networkResult);
  const utils = createUtils(components);
  const setupResult = {
    network: networkResult,
    components,
    utils,
  };

  if (!hot) setupInitialSync(setupResult, playerAddress);

  return setupResult;
}
