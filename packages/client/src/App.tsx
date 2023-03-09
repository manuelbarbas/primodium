import { useEffect, useRef, useState } from "react";

import { WagmiConfig, createClient, useAccount, Connector } from "wagmi";
import { ExternalProvider } from "@ethersproject/providers";
import { getDefaultProvider } from "ethers";
import { getNetworkLayerConfig } from "./network/config";
import { createNetworkLayer } from "./network/layer";

import SelectedTileProvider from "./context/SelectedTileContext";
import MudProvider from "./context/MudContext";

import AppLoadingState from "./AppLoadingState";

const wagmiClient = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
});

const setupNetworkLayer = async (provider: ExternalProvider | undefined) => {
  const networkLayerConfig = getNetworkLayerConfig(provider);
  return await createNetworkLayer(networkLayerConfig);
};

export default function App() {
  // Setup network layer
  const { connector: activeConnector, address } = useAccount();
  const prevAddressRef = useRef<string | undefined>("");

  const [networkLayerParams, setNetworkLayerParams] =
    useState<Awaited<ReturnType<typeof createNetworkLayer>>>();

  const setupNetworkLayerOnChange = async (
    address: string | undefined,
    activeConnector: Connector | undefined
  ) => {
    if (!address && prevAddressRef.current !== undefined) {
      const networkLayerReturn = await setupNetworkLayer(undefined);
      setNetworkLayerParams(networkLayerReturn);
      prevAddressRef.current = undefined;
    } else if (address && activeConnector) {
      if (address !== prevAddressRef.current) {
        const provider = await activeConnector.getProvider();
        const networkLayerReturn = await setupNetworkLayer(provider);
        setNetworkLayerParams(networkLayerReturn);
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
