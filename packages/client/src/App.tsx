import { useEffect, useRef, useState } from "react";

import {
  Address,
  Connector,
  WagmiConfig,
  useAccount as useWagmiAccount,
} from "wagmi";
import { getNetworkLayerConfig } from "./network/config/config";
import { Network, createNetworkLayer } from "./network/layer";

import AppLoadingState from "./AppLoadingState";
import { ampli } from "./ampli";
import { MudProvider } from "./hooks/providers/MudProvider";
import wagmiClient from "./network/wagmi";

const DEV = import.meta.env.VITE_DEV === "true";

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
    const networkLayerConfig = getNetworkLayerConfig(provider);
    const network = await createNetworkLayer(networkLayerConfig);
    setNetworkLayer(network);
    prevAddressRef.current = address;
  };

  useEffect(() => {
    setupNetworkLayerOnChange(address, activeConnector);
  }, [activeConnector, address]);

  // Amplitude Analytics
  if (DEV) {
    ampli.load({ client: { apiKey: import.meta.env.VITE_AMPLI_API_KEY_DEV } });
  } else {
    ampli.load({ client: { apiKey: import.meta.env.VITE_AMPLI_API_KEY_PROD } });
  }

  if (networkLayer === undefined) {
    return (
      <div
        style={{
          backgroundImage: "url(/img/backgrounds/star.png)",
        }}
      >
        <div className="flex items-center justify-center h-screen text-white font-mono">
          <div className="text-center">
            <p className="text-lg">Initializing...</p>
          </div>
        </div>
      </div>
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
