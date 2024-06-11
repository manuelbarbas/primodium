import { memo, useEffect, useState } from "react";

import "react-toastify/dist/ReactToastify.min.css";
import { useAccount } from "wagmi";
import AppLoadingState from "./AppLoadingState";
import { Initializing } from "./components/shared/Initializing";
import { Maintenance } from "./screens/Maintenance";
import { Core as CoreType, createCore } from "@primodiumxyz/core";
import { AccountClientProvider, CoreProvider } from "@primodiumxyz/core/react";
import { getNetworkConfig } from "@/network/config/getNetworkConfig";

const MAINTENANCE = import.meta.env.PRI_MAINTENANCE === "true";

function Core() {
  const [core, setCore] = useState<CoreType>();
  const externalAccount = useAccount();

  useEffect(() => {
    const config = getNetworkConfig();
    const core = createCore({ ...config, playerAddress: externalAccount.address });
    setCore(core);
  }, []);
  if (MAINTENANCE) return <Maintenance />;

  if (!core) return <Initializing />;

  return (
    <CoreProvider {...core}>
      <AccountClientProvider playerAddress={externalAccount.address}>
        <AppLoadingState />
      </AccountClientProvider>
    </CoreProvider>
  );
}
export default memo(Core);
