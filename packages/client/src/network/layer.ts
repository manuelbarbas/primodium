import { createFaucetService } from "@latticexyz/network";
import { defineComponentSystem, setComponent } from "@latticexyz/recs";
import { setupMUDNetwork } from "@latticexyz/std-client";
import { utils } from "ethers";

import { createPerlin } from "@latticexyz/noise";
import { NetworkConfig } from "src/util/types";
import { SystemAbis } from "../../../contracts/types/SystemAbis.mjs";
import { SystemTypes } from "../../../contracts/types/SystemTypes";
import { syncPositionComponent } from "./syncPositionComponent";
import {
  contractComponents,
  offChainComponents,
  singletonIndex,
  world,
} from "./world";

export type Network = Awaited<ReturnType<typeof createNetworkLayer>>;

export async function createNetworkLayer(config: NetworkConfig) {
  // Components contain the application state.
  // If a contractId is provided, MUD syncs the state with the corresponding
  // component contract (in this case `CounterComponent.sol`)

  const { startSync, systems, components, network, gasPriceInput$ } =
    await setupMUDNetwork<typeof contractComponents, SystemTypes>(
      config,
      world,
      contractComponents,
      SystemAbis
    );

  const intervalId = setInterval(async () => {
    const gasPrice = Math.ceil(
      (await network.providers.get().json.getGasPrice()).toNumber() * 1.1
    );
    console.log(
      "[GAS] Adjusted gas price to " +
        Math.ceil(gasPrice / 1_000_000_000) +
        " gwei"
    );
    gasPriceInput$.next(gasPrice);
  }, 5000);

  world.registerDisposer(() => clearInterval(intervalId));

  defineComponentSystem(world, components.Counter, (update) => {
    setComponent(offChainComponents.DoubleCounter, singletonIndex, {
      value: update.value[0]!.value * 2,
    });
  });

  if (!config.devMode) {
    // Faucet setup
    const faucet = config.faucetUrl
      ? createFaucetService(config.faucetUrl)
      : undefined;

    // initial drip
    const minDripAmount = config.faucetMinDripAmount
      ? config.faucetMinDripAmount.toString()
      : "0";
    const playerIsBroke = (await network.signer.get()?.getBalance())?.lte(
      utils.parseEther(minDripAmount)
    );

    if (playerIsBroke) {
      console.info("[Dev Faucet] Dripping funds to player");
      const address = network.connectedAddress.get();
      address && (await faucet?.dripDev({ address }));
    }

    // interval drip
    const intervalId2 = setInterval(async () => {
      const playerIsBroke = (await network.signer.get()?.getBalance())?.lte(
        utils.parseEther("2")
      );
      if (playerIsBroke) {
        console.info("[Dev Faucet] Dripping funds to player");
        const address = network.connectedAddress.get();
        address && (await faucet?.dripDev({ address }));
      } else {
        console.info("[Dev Faucet] Player has enough funds");
      }
    }, 20000);
    world.registerDisposer(() => clearInterval(intervalId2));
  }
  const perlin = await createPerlin();

  const context = {
    world,
    systems,
    components,
    offChainComponents,
    singletonIndex,
    providers: network.providers,
    defaultWalletAddress: config.defaultWalletAddress,
    perlin,
  };

  startSync();
  syncPositionComponent(context);

  setComponent(offChainComponents.BlockNumber, singletonIndex, {
    value: (await network.providers.get().ws?.getBlockNumber()) ?? 0,
  });

  network.blockNumber$.subscribe((blockNumber) => {
    setComponent(offChainComponents.BlockNumber, singletonIndex, {
      value: blockNumber,
    });
  });

  return context;
}
