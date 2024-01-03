import { useEffect, useState } from "react";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { WagmiConfig, useAccount } from "wagmi";
import AppLoadingState from "./AppLoadingState";
import { Initializing } from "./components/shared/Initializing";
import { MudProvider } from "./hooks/providers/MudProvider";
import { noExternalWallet } from "./network/config/getNetworkConfig";
import { setup } from "./network/setup";
import { SetupResult } from "./network/types";
import { Maintenance } from "./screens/Maintenance";
import { wagmiConfig } from "./util/web3/wagmi";

const MAINTENANCE = import.meta.env.PRI_MAINTENANCE === "true";

export default function App2() {
  const [networkLayer, setNetworkLayer] = useState<SetupResult>();
  const externalAccount = useAccount();

  useEffect(() => {
    if (!externalAccount?.address && !noExternalWallet) return;
    setup(externalAccount.address).then((result) => setNetworkLayer(result));
  }, [externalAccount.address]);

  // useEffect(() => {
  //   if (!networkLayer) return;
  //   // https://vitejs.dev/guide/env-and-mode.html
  //   if (import.meta.env.DEV) {
  //     import("@latticexyz/dev-tools").then(({ mount: mountDevTools }) =>
  //       mountDevTools({
  //         config: networkLayer.network.mudConfig,
  //         publicClient: networkLayer.network.publicClient,
  //         walletClient: networkLayer.network.walletClient,
  //         latestBlock$: networkLayer.network.latestBlock$,
  //         storedBlockLogs$: networkLayer.network.storedBlockLogs$,
  //         worldAddress: networkLayer.network.worldContract.address,
  //         worldAbi: networkLayer.network.worldContract.abi,
  //         write$: networkLayer.network.write$,
  //         recsWorld: world,
  //       })
  //     );
  //   }
  // }, [networkLayer]);

  if (MAINTENANCE) return <Maintenance />;
  console.log("networkLayer", networkLayer);

  return (
    <WagmiConfig config={wagmiConfig}>
      {!networkLayer ? (
        <Initializing />
      ) : (
        <MudProvider {...networkLayer}>
          <ToastContainer
            toastClassName={`font-mono text-xs border bg-neutral border-secondary rounded-box`}
            progressClassName={"bg-accent"}
            position="top-right"
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
      )}
    </WagmiConfig>
  );
}
