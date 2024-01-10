import { Entity } from "@latticexyz/recs";
import { useEffect } from "react";
import { ampli } from "src/ampli";
import { components } from "src/network/components";
import { useMud } from "./useMud";

export const useInit = () => {
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;
  const initialized = !!components.Home.use(playerEntity)?.value;

  useEffect(() => {
    if (!initialized) return;
    const homeAsteroid = components.Home.get(playerEntity)?.value as Entity;
    mud.components.Account.set({ value: playerEntity });
    mud.components.SelectedRock.set({ value: homeAsteroid });
    mud.components.ActiveRock.set({ value: homeAsteroid });
  }, [initialized, playerEntity, mud]);

  // The network object and user wallet will have been loaded by the time the loading state is ready
  // So we can use the user wallet to identify the user
  useEffect(() => {
    ampli.identify(mud.playerAccount.address, {});
  }, [mud.playerAccount.address]);

  return initialized;
};
