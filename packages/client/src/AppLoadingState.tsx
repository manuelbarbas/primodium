import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Progress } from "./components/core/Progress";
import { useInit } from "./hooks/useInit";
import { Enter } from "./screens/Enter";
import { Game } from "./screens/Game";
import { Increment } from "./screens/Increment";
import { Sandbox } from "./screens/Sandbox";
import { Statistics } from "./screens/Statistics";
import { useUpdateSessionAccount } from "@/hooks/useUpdateSessionAccount";
import { useEffect, useMemo } from "react";
import { useAccountClient, useSyncStatus } from "@primodiumxyz/core/react";
import { minEth } from "@primodiumxyz/core";
import { useDripAccount } from "@/hooks/useDripAccount";

export default function AppLoadingState() {
  useUpdateSessionAccount();
  const { playerBalanceData, sessionBalanceData, requestDrip } = useDripAccount();
  const { sessionAccount, playerAccount } = useAccountClient();

  useEffect(() => {
    const sessionBalance = sessionBalanceData.data?.value;
    if (!sessionAccount?.address || sessionBalanceData.isLoading || !sessionBalance || sessionBalance >= minEth) return;
    console.log("dripping session account");
    requestDrip(sessionAccount.address);
  }, [sessionAccount?.address, sessionBalanceData.data?.value, sessionBalanceData.isLoading]);

  useEffect(() => {
    const playerBalance = playerBalanceData.data?.value;
    if (sessionBalanceData.isLoading || !playerBalance || playerBalance >= minEth) return;
    console.log("dripping player account");
    requestDrip(playerAccount.address);
  }, [playerAccount.address, sessionBalanceData.isLoading, playerBalanceData.data?.value]);

  const { loading, error, progress, message } = useSyncStatus();

  const balanceReady = useMemo(() => {
    const playerBalanceReady = playerBalanceData.data?.value ?? 0n >= minEth;
    const sessionBalanceReady = !sessionAccount || (sessionBalanceData.data?.value ?? 0n >= minEth);
    return playerBalanceReady && sessionBalanceReady;
  }, [loading, playerBalanceData, sessionAccount, sessionBalanceData]);
  return (
    <div className="h-screen relative">
      {!error && (
        <div className="relative">
          {!loading && !balanceReady && (
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
          {!loading && balanceReady && (
            <BrowserRouter>
              <PrimodiumRoutes />
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

const PrimodiumRoutes = () => {
  const location = useLocation();
  const initialized = useInit();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={{ pathname: "/game", search: location.search }} />} />
      <Route path="/game" element={initialized ? <Game /> : <Enter />} />
      <Route path="/increment" element={<Increment />} />
      <Route path="/statistics" element={<Statistics />} />
      <Route path="/sandbox" element={<Sandbox />} />
    </Routes>
  );
};
