import { useEffect } from "react";
import { ampli } from "src/ampli";
import { setupBlockNumber } from "src/network/systems/setupBlockNumber";
import { setupDoubleCounter } from "src/network/systems/setupDoubleCounter";
import { useMud } from "./useMud";
import { components } from "src/network/components";
import { setupHangar } from "src/network/systems/setupHangar";
import { setupArrival } from "src/network/systems/setupArrival";

export const useInit = () => {
  const mud = useMud();
  const playerEntity = mud.network.playerEntity;
  const initialized = !!components.Home.use(playerEntity)?.asteroid;

  //initialize systems
  useEffect(() => {
    setupBlockNumber(mud.network.latestBlockNumber$);
    setupDoubleCounter(mud);
    setupHangar();
    setupArrival();
  }, [mud]);

  // The network object and user wallet will have been loaded by the time the loading state is ready
  // So we can use the user wallet to identify the user
  useEffect(() => {
    ampli.identify(mud.network.address, {});
  }, [mud.network.address]);

  return initialized;
};
