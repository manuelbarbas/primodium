import { useEffect, useRef, useState } from "react";

import {
  WagmiConfig,
  createClient,
  useAccount as useWagmiAccount,
  Connector,
} from "wagmi";
import { ExternalProvider } from "@ethersproject/providers";
import { getDefaultProvider } from "ethers";
import { devConfig, getNetworkLayerConfig } from "./network/config";
import { createNetworkLayer } from "./network/layer";

import SelectedTileProvider from "./context/SelectedTileContext";
import MudProvider from "./context/MudContext";

import AppLoadingState from "./AppLoadingState";

const wagmiClient = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
});

const setupNetworkLayer = async (provider: ExternalProvider | undefined) => {
  const networkLayerConfig =
    provider === undefined ? devConfig() : getNetworkLayerConfig(provider);
  const networkLayerReturn = await createNetworkLayer(
    networkLayerConfig.config
  );
  return {
    defaultWalletAddress: networkLayerConfig.defaultWalletAddress,
    networkLayer: networkLayerReturn,
  };
};

export default function App() {
  // Setup network layer
  const { connector: activeConnector, address } = useWagmiAccount();
  const prevAddressRef = useRef<string | undefined>("");

  const [networkLayerParams, setNetworkLayerParams] =
    useState<Awaited<ReturnType<typeof createNetworkLayer>>>();

  // default wallet address that is provided by the browser if the user is not logged in
  const defaultWalletAddressRef = useRef<string | undefined>(undefined);

  const setupNetworkLayerOnChange = async (
    address: string | undefined,
    activeConnector: Connector | undefined
  ) => {
    if (!address && prevAddressRef.current !== undefined) {
      const networkLayerReturn = await setupNetworkLayer(undefined);
      setNetworkLayerParams(networkLayerReturn.networkLayer);

      defaultWalletAddressRef.current = networkLayerReturn.defaultWalletAddress;
      prevAddressRef.current = undefined;
    } else if (address && activeConnector) {
      if (address !== prevAddressRef.current) {
        const provider = await activeConnector.getProvider();
        const networkLayerReturn = await setupNetworkLayer(provider);
        setNetworkLayerParams(networkLayerReturn.networkLayer);

        defaultWalletAddressRef.current =
          networkLayerReturn.defaultWalletAddress;
        prevAddressRef.current = address;
      }
    }
  };

  useEffect(() => {
    setupNetworkLayerOnChange(address, activeConnector);
  }, [activeConnector, address]);

  if (networkLayerParams === undefined) {
    return <p>Loading...</p>;
  } else {
    return (
      <MudProvider
        world={networkLayerParams.world}
        systems={networkLayerParams.systems}
        components={networkLayerParams.components}
        offChainComponents={networkLayerParams.offChainComponents}
        singletonIndex={networkLayerParams.singletonIndex}
        defaultWalletAddress={defaultWalletAddressRef.current}
      >
        <WagmiConfig client={wagmiClient}>
          <SelectedTileProvider>
            <AppLoadingState />
          </SelectedTileProvider>
        </WagmiConfig>
      </MudProvider>
    );
  }
}
