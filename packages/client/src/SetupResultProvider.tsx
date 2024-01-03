import { useEffect } from "react";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { useAccount } from "wagmi";
import AppLoadingState from "./AppLoadingState";
import { Initializing } from "./components/shared/Initializing";
import { MudProvider } from "./hooks/providers/MudProvider";
import useGame from "./hooks/useGame";
import { world } from "./network/world";
import { Maintenance } from "./screens/Maintenance";

const MAINTENANCE = import.meta.env.PRI_MAINTENANCE === "true";

export default function SetupResultProvider() {
  const game = useGame();
  const { network, updatePlayerAccount, playerAccount, components } = game;
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

  if (externalAccount.isReconnecting || !externalAccount?.address) return null;

  return !network || !playerAccount || !components ? (
    <Initializing />
  ) : (
    <MudProvider {...game} components={components} network={network} playerAccount={playerAccount}>
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
