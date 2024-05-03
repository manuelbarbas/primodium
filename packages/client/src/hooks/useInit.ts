import { useEffect } from "react";
import { ampli } from "src/ampli";
import { components } from "src/network/components";
import { useMud } from "./useMud";

export const useInit = () => {
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;
  const initialized = !!components.Spawned.use(playerEntity)?.value;

  useEffect(() => {
    if (!initialized) return;
    mud.components.Account.set({ value: playerEntity });
  }, [initialized, playerEntity, mud]);

  // The network object and user wallet will have been loaded by the time the loading state is ready
  // So we can use the user wallet to identify the user
  useEffect(() => {
    ampli.identify(mud.playerAccount.address, {});
  }, [mud.playerAccount.address]);

  return initialized;
};
