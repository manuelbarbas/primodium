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
  const { playerAccountBalance, sessionAccountBalance, requestDrip } = useDripAccount();
  const { sessionAccount, playerAccount } = useAccountClient();

  useEffect(() => {
    if (!sessionAccount?.address || sessionAccountBalance >= minEth) return;
    requestDrip(sessionAccount.address);
  }, [sessionAccount?.address, sessionAccountBalance]);

  useEffect(() => {
    if (sessionAccountBalance >= minEth) return;
    requestDrip(playerAccount.address);
  }, [playerAccount.address, playerAccountBalance]);

  const { loading, error, progress, message } = useSyncStatus();

  const ready = useMemo(() => !loading && playerAccountBalance >= minEth, [loading, playerAccountBalance]);
  return (
    <div className="h-screen relative">
      {!error && (
        <div className="relative">
          {!loading && playerAccountBalance < minEth && (
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

export const PrimodiumRoutes = () => {
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
