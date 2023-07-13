import { useEffect, useRef, useState } from "react";

import { Connector, WagmiConfig, useAccount as useWagmiAccount } from "wagmi";
import { devConfig, getNetworkLayerConfig } from "./network/config";
import { Network, createNetworkLayer } from "./network/layer";

import AppLoadingState from "./AppLoadingState";
import { MudProvider } from "./context/MudContext";
import wagmiClient from "./network/wagmi";

type Address = `0x${string}`;

export default function App() {
  // Setup network layer
  const { connector: activeConnector, address } = useWagmiAccount();
  const prevAddressRef = useRef<Address | undefined>();

  const [networkLayer, setNetworkLayer] = useState<Network>();

  const setupNetworkLayerOnChange = async (
    address: Address | undefined,
    activeConnector: Connector | undefined
  ) => {
    if (prevAddressRef.current && address === prevAddressRef.current) return;
    const provider = await activeConnector?.getProvider();
    const networkLayerConfig =
      provider === undefined ? devConfig() : getNetworkLayerConfig(provider);
    const network = await createNetworkLayer(networkLayerConfig);
    setNetworkLayer(network);
    prevAddressRef.current = address;
  };

  useEffect(() => {
    setupNetworkLayerOnChange(address, activeConnector);
  }, [activeConnector, address]);

  if (networkLayer === undefined) {
    return (
      <>
        <div className="flex items-center justify-center h-screen bg-gray-700 text-white font-mono">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Primodium</h1>
            <p className="text-lg">Initializing...</p>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <WagmiConfig client={wagmiClient}>
        <MudProvider {...networkLayer}>
          <AppLoadingState />
        </MudProvider>
      </WagmiConfig>
    );
  }
}
