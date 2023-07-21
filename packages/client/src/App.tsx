import { useEffect, useMemo, useRef, useState } from "react";

import {
  Address,
  Connector,
  WagmiConfig,
  useAccount as useWagmiAccount,
} from "wagmi";
import { getNetworkLayerConfig } from "./network/config/config";
import { Network, createNetworkLayer } from "./network/layer";

import { MudProvider } from "./context/MudContext";
import wagmiClient from "./network/wagmi";
import {
  BackgroundImage,
  ResearchImage,
  ResourceImage,
} from "./util/constants";
import { getBlockTypeName } from "./util/common";

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
          <ImageGrid />
        </MudProvider>
      </WagmiConfig>
    );
  }
}

const ImageGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "background" | "resource" | "research"
  >("background");

  const images = useMemo(() => {
    if (activeTab == "background") return [...BackgroundImage.entries()];
    if (activeTab == "resource") return [...ResourceImage.entries()];
    return [...ResearchImage.entries()];
  }, [activeTab]);
  console.log(images);

  return (
    <div className="fixed top-0 left-0 w-full h-full p-4 z-10 bg-white overflow-auto">
      <div className="mb-4 border-b-2">
        <button
          className={`px-4 py-2 ${
            activeTab === "background" ? "border-b-2 border-blue-600" : ""
          }`}
          onClick={() => setActiveTab("background")}
        >
          Background
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "resource" ? "border-b-2 border-blue-600" : ""
          }`}
          onClick={() => setActiveTab("resource")}
        >
          Resource
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "research" ? "border-b-2 border-blue-600" : ""
          }`}
          onClick={() => setActiveTab("research")}
        >
          Research
        </button>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {images.map(([name, uri], index) => (
          <>
            <p>{getBlockTypeName(name)}</p>
            <img
              key={index}
              src={uri}
              alt={`Image ${getBlockTypeName(name)}`}
              className="w-40 h-40 object-cover shadow-md"
            />
          </>
        ))}
      </div>
    </div>
  );
};
