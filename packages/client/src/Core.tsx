import { memo, useMemo } from "react";

import "react-toastify/dist/ReactToastify.min.css";
import { useShallow } from "zustand/react/shallow";
import { useAccount } from "wagmi";
import AppLoadingState from "./AppLoadingState";
import { Initializing } from "./components/shared/Initializing";
import { Maintenance } from "./screens/Maintenance";
import { createCore } from "@primodiumxyz/core";
import { AccountClientProvider, CoreProvider } from "@primodiumxyz/core/react";
import { getCoreConfig } from "@/config/getCoreConfig";
import { usePersistentStore } from "@primodiumxyz/game/src/stores/PersistentStore";
import { Hex } from "viem";
import { generatePrivateKey, privateKeyToAddress } from "viem/accounts";

const MAINTENANCE = import.meta.env.PRI_MAINTENANCE === "true";

function Core() {
  const externalAccount = useAccount();
  const { noExternalAccount } = usePersistentStore(
    useShallow((state) => ({ noExternalAccount: state.noExternalAccount }))
  );

  const { playerPrivateKey, playerAddress, core } = useMemo(() => {
    const config = getCoreConfig();
    const playerPrivateKey = noExternalAccount
      ? (localStorage.getItem("primodiumPlayerAccount") as Hex) ?? generatePrivateKey()
      : undefined;

    const playerAddress = playerPrivateKey ? privateKeyToAddress(playerPrivateKey) : externalAccount.address;
    const core = createCore({ ...config, playerAddress });
    const ret = { playerPrivateKey, playerAddress, core };
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
