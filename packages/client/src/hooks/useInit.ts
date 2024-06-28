import { useAccountClient, useCore, useSyncStatus } from "@primodiumxyz/core/react";
import { useEffect, useState } from "react";
import { ampli } from "@/ampli";
import { Keys } from "@primodiumxyz/core";
import { setupSessionAccount } from "@/systems/setupSessionAccount";

export const useInit = () => {
  const core = useCore();
  const account = useAccountClient();
  const {
    tables,
    network: { world },
  } = core;

  const {
    playerAccount: { address, entity },
  } = account;
  const { loading } = useSyncStatus(Keys.SECONDARY);
  const initialized = !!tables.Spawned.use(entity)?.value;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    tables.Account.set({ value: entity });

    if (loading || !address || !entity) return;

    setupSessionAccount(core, account);

    setReady(true);

    return () => {
      world.dispose("clientSystems");
      setReady(false);
    };
  }, [loading, address, entity, initialized]);

  // The network object and user wallet will have been loaded by the time the loading state is ready
  // So we can use the user wallet to identify the user
  useEffect(() => {
    ampli.identify(address, {});
  }, [address]);

  return ready;
};
