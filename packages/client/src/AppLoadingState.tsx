import { transportObserver } from "@latticexyz/common";
import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { setupSessionAccount } from "src/network/systems/setupSessionAccount";
import { createPublicClient, fallback, http } from "viem";
import { Progress } from "./components/core/Progress";
import { useMud } from "./hooks";
import { useInit } from "./hooks/useInit";
import { useSyncStatus } from "./hooks/useSyncStatus";
import { getNetworkConfig } from "./network/config/getNetworkConfig";
import { Enter } from "./screens/Enter";
import { Game } from "./screens/Game";
import { Increment } from "./screens/Increment";
import { Sandbox } from "./screens/Sandbox";
import { Statistics } from "./screens/Statistics";
import { minEth } from "./util/constants";

export const DEV = import.meta.env.PRI_DEV === "true";
export const DEV_CHAIN = import.meta.env.PRI_CHAIN_ID === "dev";

export default function AppLoadingState() {
  const mud = useMud();
  const initialized = useInit();
  const [balance, setBalance] = useState<bigint>();

  useEffect(() => {
    mud.removeSessionAccount();
    setupSessionAccount(mud.playerAccount.entity, mud.removeSessionAccount, mud.updateSessionAccount);
  }, [mud.playerAccount.entity]);

  useEffect(() => {
    const networkConfig = getNetworkConfig();
    const clientOptions = {
      chain: networkConfig.chain,
      transport: transportObserver(fallback([http()])),
    };
    /* Since this system modifies mud.sessionAccount, it can't have mud as a dependency */

    const publicClient = createPublicClient(clientOptions);

    const updateBalance = setInterval(async () => {
      if (DEV_CHAIN || (balance ?? 0n) > minEth) return;
      const bal = await publicClient.getBalance({ address: mud.playerAccount.address });
      setBalance(bal);
    }, 1000);
    return () => clearInterval(updateBalance);
  }, [balance, mud.playerAccount.address, mud.playerAccount.publicClient]);

  const { loading, message, progress, error } = useSyncStatus();

  const enoughEth = useMemo(() => DEV_CHAIN || (balance ?? 0n) >= minEth, [balance]);
  const ready = useMemo(() => !loading && enoughEth, [loading, enoughEth]);

  return (
    <div className="h-screen relative">
      {!error && (
        <div className="relative">
          {!loading && !enoughEth && (
            <div className="flex flex-col items-center justify-center h-screen text-white gap-4">
              <p className="text-lg text-white">
                <span className="">Dripping Eth to Primodium account</span>
                <span>&hellip;</span>
              </p>
              <Progress value={100} max={100} className="animate-pulse w-56" />
            </div>
          )}
          {loading && (
            <div className="flex items-center justify-center h-screen">
              <div className="flex flex-col items-center gap-4">
                <p className="text-lg text-white">
                  <span className="">{message}</span>
                  {progress > 0 ? (
                    <span className="">&nbsp;({Math.floor(progress * 100)}%)</span>
                  ) : (
                    <span>&hellip;</span>
                  )}
                </p>
                {progress === 0 ? (
                  <Progress value={1} max={1} className="animate-pulse w-56" />
                ) : (
                  <Progress value={progress} max={1} className="w-56" />
                )}
              </div>
            </div>
          )}
          {ready && (
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/game" replace />} />
                <Route path="/game" element={initialized ? <Game /> : <Enter />} />
                <Route path="/increment" element={<Increment />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/sandbox" element={<Sandbox />} />
              </Routes>
            </BrowserRouter>
          )}
        </div>
      )}
      {error && (
        <div className="flex flex-col items-center justify-center h-screen text-white gap-4">
          <p className="text-lg text-white">
            <span className="">{message}</span>
          </p>
        </div>
      )}
    </div>
  );
}
