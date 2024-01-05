import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useEffect } from "react";
import { ampli } from "src/ampli";
import { components } from "src/network/components";
import { setupAllianceLeaderboard } from "src/network/systems/setupAllianceLeaderboard";
import { setupArrival } from "src/network/systems/setupArrival";
import { setupBattleNotifications } from "src/network/systems/setupBattleNotifications";
import { setupBlockNumber } from "src/network/systems/setupBlockNumber";
import { setupDelegate } from "src/network/systems/setupDelegate";
import { setupDoubleCounter } from "src/network/systems/setupDoubleCounter";
import { setupHangar } from "src/network/systems/setupHangar";
import { setupLeaderboard } from "src/network/systems/setupLeaderboard";
import { setupInvitations } from "src/network/systems/setupPlayerInvites";
import { setupSend } from "src/network/systems/setupSend";
import { setupTime } from "src/network/systems/setupTime";
import { setupTrainingQueues } from "src/network/systems/setupTrainingQueues";
import { useMud } from "./useMud";

export const useInit = () => {
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;
  const initialized = !!components.Home.use(playerEntity)?.asteroid;

  //initialize systems
  useEffect(() => {
    console.log("initializing systems");
    setupBlockNumber(mud.network.latestBlockNumber$);
    setupLeaderboard(mud);
    setupAllianceLeaderboard(mud);
    setupTrainingQueues(mud);
    setupHangar(mud);
    setupSend(mud);
    setupArrival();
    setupInvitations(mud);
    setupBattleNotifications(mud);
    setupTime(mud);
    setupDelegate(mud);

    setupDoubleCounter(mud);
  }, [mud.network]);

  useEffect(() => {
    if (!initialized) return;
    mud.components.Account.set({ value: playerEntity });
    mud.components.SelectedRock.set({
      value: (components.Home.get(playerEntity)?.asteroid ?? singletonEntity) as Entity,
    });
    mud.components.ActiveRock.set({
      value: (components.Home.get(playerEntity)?.asteroid ?? singletonEntity) as Entity,
    });
  }, [initialized, playerEntity]);

  // The network object and user wallet will have been loaded by the time the loading state is ready
  // So we can use the user wallet to identify the user
  useEffect(() => {
    ampli.identify(mud.playerAccount.address, {});
  }, [mud.playerAccount.address]);

  return initialized;
};
