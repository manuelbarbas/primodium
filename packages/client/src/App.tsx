import { useEffect, useRef } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import { WagmiConfig, createClient, useAccount, Connector } from "wagmi";
import { ExternalProvider } from "@ethersproject/providers";
import { getDefaultProvider } from "ethers";
import { getNetworkLayerConfig } from "./network/config";
import { createNetworkLayer } from "./network/layer";

import Home from "./screens/Home";
import Increment from "./screens/Increment";
import Map from "./screens/Map";
import LeafletMapDebug from "./screens/LeafletMapDebug";
import SelectedTileProvider from "./context/SelectedTileContext";

import MudProvider from "./context/MudContext";

const wagmiClient = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
});

const setupNetworkLayer = async (provider: ExternalProvider | undefined) => {
  const networkLayerConfig = getNetworkLayerConfig(provider);
  return await createNetworkLayer(networkLayerConfig);
};

export default function App() {
  const { connector: activeConnector, address } = useAccount();
  const prevAddressRef = useRef<string | undefined>("");

  const networkLayerReturnRef =
    useRef<Awaited<ReturnType<typeof createNetworkLayer>>>();

  const setupNetworkLayerOnChange = async (
    address: string | undefined,
    activeConnector: Connector | undefined
  ) => {
    if (!address && prevAddressRef.current !== undefined) {
      const networkLayerReturn = await setupNetworkLayer(undefined);
      networkLayerReturnRef.current = networkLayerReturn;
      prevAddressRef.current = undefined;
    } else if (address && activeConnector) {
      if (address !== prevAddressRef.current) {
        const provider = await activeConnector.getProvider();
        const networkLayerReturn = await setupNetworkLayer(provider);
        networkLayerReturnRef.current = networkLayerReturn;
        prevAddressRef.current = address;
      }
    }
  };

  useEffect(() => {
    setupNetworkLayerOnChange(address, activeConnector);
  }, [activeConnector, address]);

  if (networkLayerReturnRef.current === undefined) {
    return <p>Loading...</p>;
  } else {
    return (
      <MudProvider
        world={networkLayerReturnRef.current.world}
        systems={networkLayerReturnRef.current.systems}
        components={networkLayerReturnRef.current.components}
        offChainComponents={networkLayerReturnRef.current.offChainComponents}
        singletonIndex={networkLayerReturnRef.current.singletonIndex}
      >
        <WagmiConfig client={wagmiClient}>
          <SelectedTileProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/increment" element={<Increment />} />
                <Route path="/map" element={<Map />} />
                <Route path="/leaflet" element={<LeafletMapDebug />} />
              </Routes>
            </BrowserRouter>
          </SelectedTileProvider>
        </WagmiConfig>
      </MudProvider>
    );
  }
}
