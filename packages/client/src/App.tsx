import { useEffect, useState } from "react";

import AppLoadingState from "./AppLoadingState";
import { ampli } from "./ampli";
import { MudProvider } from "./hooks/providers/MudProvider";
import { setup } from "./network/setup";
import { SetupResult } from "./network/types";

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
      <MudProvider {...networkLayer}>
        <AppLoadingState />
      </MudProvider>
    );
  }
}
