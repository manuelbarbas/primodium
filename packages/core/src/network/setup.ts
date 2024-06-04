import { createComponents } from "@/components/createComponents";
import { createNetwork, network } from "@/network/createNetwork";
import { setupInitialSync } from "@/sync/setupInitialSync";
import { SetupResult } from "@/types";
import { Hex } from "viem";

export async function setup(playerAddress: Hex): Promise<SetupResult> {
  const hot = network !== undefined;
  const networkResult = createNetwork();
  const comps = createComponents(networkResult);
  const setupResult = {
    network: networkResult,
    components: comps,
  };

  if (!hot) setupInitialSync(setupResult, playerAddress);

  return setupResult;
}
