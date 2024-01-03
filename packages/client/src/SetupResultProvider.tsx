import { useEffect, useState } from "react";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { useAccount } from "wagmi";
import AppLoadingState from "./AppLoadingState";
import { Initializing } from "./components/shared/Initializing";
import { MudProvider } from "./hooks/providers/MudProvider";
import { noExternalWallet } from "./network/config/getNetworkConfig";
import { setup } from "./network/setup";
import { SetupResult } from "./network/types";
import { world } from "./network/world";
import { Maintenance } from "./screens/Maintenance";

const MAINTENANCE = import.meta.env.PRI_MAINTENANCE === "true";

export default function SetupResultProvider() {
  const [setupResult, setSetupResult] = useState<SetupResult>();
  const externalAccount = useAccount();

  useEffect(() => {
    if (!externalAccount?.address && !noExternalWallet) return;
    setup(externalAccount.address).then((result) => setSetupResult(result));
  }, [externalAccount.address]);

  useEffect(() => {
    if (!setupResult) return;
    // https://vitejs.dev/guide/env-and-mode.html
    if (import.meta.env.DEV) {
      import("@latticexyz/dev-tools").then(({ mount: mountDevTools }) =>
        mountDevTools({
          config: setupResult.network.mudConfig,
          publicClient: setupResult.network.playerAccount.publicClient,
          walletClient: setupResult.network.playerAccount.walletClient,
          latestBlock$: setupResult.network.latestBlock$,
          storedBlockLogs$: setupResult.network.storedBlockLogs$,
          worldAddress: setupResult.network.playerAccount.worldContract.address,
          worldAbi: setupResult.network.playerAccount.worldContract.abi,
          write$: setupResult.network.write$,
          recsWorld: world,
        })
      );
    }
  }, [setupResult]);

  if (MAINTENANCE) return <Maintenance />;

  if (!externalAccount?.address && !noExternalWallet) return null;

  return !setupResult ? (
    <Initializing />
  ) : (
    <MudProvider {...setupResult}>
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
  );
}
