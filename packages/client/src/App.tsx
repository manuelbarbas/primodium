import { useEffect, useState } from "react";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import AppLoadingState from "./AppLoadingState";
import { ampli } from "./ampli";
import { MudProvider } from "./hooks/providers/MudProvider";
import { setup } from "./network/setup";
import { SetupResult } from "./network/types";
import { world } from "./network/world";
import { Progress } from "./components/core/Progress";

const DEV = import.meta.env.PRI_DEV === "true";

export default function App() {
  const [networkLayer, setNetworkLayer] = useState<SetupResult>();

  useEffect(() => {
    async function setupNetwork() {
      const result = await setup();
      setNetworkLayer(result);
    }
    setupNetwork();
  }, []);

  // Amplitude Analytics
  if (DEV) {
    ampli.load({ client: { apiKey: import.meta.env.PRI_AMPLI_API_KEY_DEV } });
  } else {
    ampli.load({ client: { apiKey: import.meta.env.PRI_AMPLI_API_KEY_PROD } });
  }
  useEffect(() => {
    if (!networkLayer) return;
    // https://vitejs.dev/guide/env-and-mode.html
    if (import.meta.env.DEV) {
      import("@latticexyz/dev-tools").then(({ mount: mountDevTools }) =>
        mountDevTools({
          config: networkLayer.network.mudConfig,
          publicClient: networkLayer.network.publicClient,
          walletClient: networkLayer.network.walletClient,
          latestBlock$: networkLayer.network.latestBlock$,
          storedBlockLogs$: networkLayer.network.storedBlockLogs$,
          worldAddress: networkLayer.network.worldContract.address,
          worldAbi: networkLayer.network.worldContract.abi,
          write$: networkLayer.network.write$,
          recsWorld: world,
        })
      );
    }
  }, [networkLayer]);

  if (networkLayer === undefined) {
    return (
      <div className="relative bg-black">
        <div className="absolute w-full h-full star-background opacity-50" />
        <div className="flex flex-col items-center justify-center h-screen text-white font-mono gap-4">
          <p className="text-lg text-white">
            <span className="font-mono">Initializing</span>
            <span>&hellip;</span>
          </p>
          <Progress value={100} max={100} className="animate-pulse" />
        </div>
      </div>
    );
  } else {
    return (
      <MudProvider {...networkLayer}>
        <ToastContainer
          toastClassName={`font-mono text-xs border bg-neutral border-secondary rounded-box drop-shadow-2xl`}
          progressClassName={"bg-accent"}
          position="top-left"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <AppLoadingState />
      </MudProvider>
    );
  }
}
