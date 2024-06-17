import { setupInvitations } from "@/systems/setupPlayerInvites";
import { setupMovementNotifications } from "@/systems/setupMovementNotifications";
import { setupSwapNotifications } from "@/systems/setupSwapNotifications";
import { useAccountClient, useCore } from "@primodiumxyz/core/react";
import { useEffect } from "react";
import { ampli } from "src/ampli";

export const useInit = () => {
  const core = useCore();
  const {
    tables,
    network: { world },
  } = core;
  const { address, entity } = useAccountClient().playerAccount;
  const initialized = !!tables.Spawned.use(entity)?.value;

  useEffect(() => {
    if (!initialized) return;
    tables.Account.set({ value: entity });
    setupInvitations(core);
    setupMovementNotifications(core);
    setupSwapNotifications(core);

    return () => {
      world.dispose("clientSystems");
    };
  }, [initialized, entity]);

  // The network object and user wallet will have been loaded by the time the loading state is ready
  // So we can use the user wallet to identify the user
  useEffect(() => {
    ampli.identify(address, {});
  }, [address]);

  return initialized;
};
