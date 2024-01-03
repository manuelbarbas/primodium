import { useEffect } from "react";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { useAccount } from "wagmi";
import AppLoadingState from "./AppLoadingState";
import { Initializing } from "./components/shared/Initializing";
import { MudProvider } from "./hooks/providers/MudProvider";
import useSetupResult from "./hooks/useSetupResult";
import { world } from "./network/world";
import { Maintenance } from "./screens/Maintenance";

const MAINTENANCE = import.meta.env.PRI_MAINTENANCE === "true";

export default function SetupResultProvider() {
  const setupResult = useSetupResult();
  const { network, updatePlayerAccount, playerAccount, components, contractCalls } = setupResult;
  const externalAccount = useAccount();

  useEffect(() => {
    if (!externalAccount?.address) return;
    updatePlayerAccount(externalAccount.address);
  }, [externalAccount.address, updatePlayerAccount]);

  useEffect(() => {
    if (!network || !playerAccount) return;
    // https://vitejs.dev/guide/env-and-mode.html
    if (import.meta.env.DEV) {
      import("@latticexyz/dev-tools").then(({ mount: mountDevTools }) =>
        mountDevTools({
          config: network.mudConfig,
          publicClient: playerAccount.publicClient,
          walletClient: playerAccount.walletClient,
          latestBlock$: network.latestBlock$,
          storedBlockLogs$: network.storedBlockLogs$,
          worldAddress: playerAccount.worldContract.address,
          worldAbi: playerAccount.worldContract.abi,
          write$: playerAccount.write$,
          recsWorld: world,
        })
      );
    }
  }, [network, playerAccount]);

  if (MAINTENANCE) return <Maintenance />;

  if (externalAccount.status !== "connected") return null;

  if (!network || !playerAccount || !components || !contractCalls) return <Initializing />;
  return (
    <MudProvider
      {...setupResult}
      contractCalls={contractCalls}
      components={components}
      network={network}
      playerAccount={playerAccount}
    >
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
