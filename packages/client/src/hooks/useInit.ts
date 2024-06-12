import { useAccountClient, useCore } from "@primodiumxyz/core/react";
import { useEffect } from "react";
import { ampli } from "src/ampli";

export const useInit = () => {
  const { tables } = useCore();
  const { address, entity } = useAccountClient().playerAccount;
  const initialized = !!tables.Spawned.use(entity)?.value;

  useEffect(() => {
    if (!initialized) return;
    tables.Account.set({ value: entity });
  }, [initialized, entity]);

  // The network object and user wallet will have been loaded by the time the loading state is ready
  // So we can use the user wallet to identify the user
  useEffect(() => {
    ampli.identify(address, {});
  }, [address]);

  return initialized;
};
