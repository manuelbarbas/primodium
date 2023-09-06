import { useEffect, useState } from "react";

import mudConfig from "contracts/mud.config";
import AppLoadingState from "./AppLoadingState";
import { ampli } from "./ampli";
import { ComponentBrowser } from "./components/dev/ComponentBrowser";
import { MudProvider } from "./hooks/providers/MudProvider";
import { setup } from "./network/setup";
import { SetupResult } from "./network/types";
import { world } from "./network/world";

const DEV = import.meta.env.VITE_DEV === "true";

export default function App() {
  const [networkLayer, setNetworkLayer] = useState<SetupResult>();

  useEffect(() => {
    async function setupNetwork() {
      const result = await setup();
      setNetworkLayer(result);
    }
    setupNetwork();
  }, []);

  useEffect(() => {
    return;
    if (!networkLayer) return;

    // https://vitejs.dev/guide/env-and-mode.html
    if (DEV) {
      import("@latticexyz/dev-tools").then(({ mount: mountDevTools }) =>
        mountDevTools({
          config: mudConfig,
          publicClient: networkLayer.network.publicClient,
          walletClient: networkLayer.network.walletClient,
          latestBlock$: networkLayer.network.latestBlock$,
          blockStorageOperations$: networkLayer.network.blockStorageOperations$,
          worldAddress: networkLayer.network.worldContract.address,
          worldAbi: networkLayer.network.worldContract.abi,
          write$: networkLayer.network.write$,
          recsWorld: world,
        })
      );
    }
  }, [networkLayer]);

  // Amplitude Analytics
  if (DEV) {
    ampli.load({ client: { apiKey: import.meta.env.VITE_AMPLI_API_KEY_DEV } });
  } else {
    ampli.load({ client: { apiKey: import.meta.env.VITE_AMPLI_API_KEY_PROD } });
  }

  if (networkLayer === undefined) {
    return (
      <div className="relative bg-black">
        <div className="absolute w-full h-full star-background opacity-50" />
        <div className="relative flex items-center justify-center h-screen text-white font-mono">
          <div className="text-center">
            <p className="text-lg">Initializing...</p>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <MudProvider {...networkLayer}>
        <AppLoadingState />
        {DEV && <ComponentBrowser />}
      </MudProvider>
    );
  }
}
