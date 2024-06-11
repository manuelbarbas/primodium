import { useEffect, useRef } from "react";
import { useAccountClient, useCore } from "@primodiumxyz/core/react";

export const useMountDevTools = (): boolean => {
  const mounted = useRef<boolean>(false);
  const { network } = useCore();
  const accountClient = useAccountClient();
  const { playerAccount } = accountClient;

  useEffect(() => {
    if (import.meta.env.PRI_DEV !== "true" || !network || !playerAccount || mounted.current) return;

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
        recsWorld: network.world,
      })
    );

    mounted.current = true;
  }, [network, playerAccount, mounted]);
  return mounted.current;
};
