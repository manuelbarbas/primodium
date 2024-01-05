import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useEffect } from "react";
import { ampli } from "src/ampli";
import { components } from "src/network/components";
import { entityToAddress } from "src/util/common";
import { useMud } from "./useMud";

export const useInit = () => {
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;
  const init = components.Home.use(mud.playerAccount.entity)?.asteroid;
  const initialized = init;
  console.log("playerEntity", entityToAddress(playerEntity), "initialized", initialized);

  useEffect(() => {
    if (!initialized) return;
    mud.components.Account.set({ value: playerEntity });
    mud.components.SelectedRock.set({
      value: (components.Home.get(playerEntity)?.asteroid ?? singletonEntity) as Entity,
    });
    mud.components.ActiveRock.set({
      value: (components.Home.get(playerEntity)?.asteroid ?? singletonEntity) as Entity,
    });
  }, [initialized, playerEntity, mud.components]);

  // The network object and user wallet will have been loaded by the time the loading state is ready
  // So we can use the user wallet to identify the user
  useEffect(() => {
    ampli.identify(mud.playerAccount.address, {});
  }, [mud.playerAccount.address]);

  return initialized;
};
