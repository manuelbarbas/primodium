import { memo, useMemo, useRef } from "react";

import "react-toastify/dist/ReactToastify.min.css";
import { useShallow } from "zustand/react/shallow";
import { useAccount } from "wagmi";
import AppLoadingState from "./AppLoadingState";
import { Initializing } from "./components/shared/Initializing";
import { Maintenance } from "./screens/Maintenance";
import { Core as CoreType, createCore } from "@primodiumxyz/core";
import { AccountClientProvider, CoreProvider } from "@primodiumxyz/core/react";
import { getCoreConfig } from "@/config/getCoreConfig";
import { usePersistentStore } from "@primodiumxyz/game/src/stores/PersistentStore";
import { Hex } from "viem";
import { generatePrivateKey, privateKeyToAddress } from "viem/accounts";

const MAINTENANCE = import.meta.env.PRI_MAINTENANCE === "true";

function Core() {
  const coreRef = useRef<CoreType | null>(null);
  const externalAccount = useAccount();
  const { noExternalAccount } = usePersistentStore(
    useShallow((state) => ({ noExternalAccount: state.noExternalAccount }))
  );

  const core = useMemo(() => {
    if (coreRef.current) coreRef.current.network.world.dispose();
    const config = getCoreConfig();
    return createCore(config);
  }, []);

  const { playerPrivateKey, playerAddress } = useMemo(() => {
    const playerPrivateKey = noExternalAccount
      ? (localStorage.getItem("primodiumPlayerAccount") as Hex) ?? generatePrivateKey()
      : undefined;

    const playerAddress = playerPrivateKey ? privateKeyToAddress(playerPrivateKey) : externalAccount.address;

    const ret = { playerPrivateKey, playerAddress };
    return ret;
  }, [noExternalAccount, externalAccount.address]);
  if (MAINTENANCE) return <Maintenance />;

  if (!noExternalAccount && !externalAccount.isConnected) return null;
  if (!core) return <Initializing />;

  return (
    <CoreProvider {...core}>
      <AccountClientProvider playerAddress={playerAddress} playerPrivateKey={playerPrivateKey}>
        <AppLoadingState />
      </AccountClientProvider>
    </CoreProvider>
  );
}
export default memo(Core);
