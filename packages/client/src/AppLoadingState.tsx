import { minEth } from "@game/constants";
import { SyncStep } from "@latticexyz/store-sync";
import { Browser } from "@primodiumxyz/mud-game-tools";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Progress } from "./components/core/Progress";
import { useMud } from "./hooks";
import { useInit } from "./hooks/useInit";
import { components } from "./network/components";
import { world } from "./network/world";
import { Account } from "./screens/Account";
import { Game } from "./screens/Game";
import { Increment } from "./screens/Increment";
import { Landing } from "./screens/Landing";
import { Statistics } from "./screens/Statistics";
import { setupCheatcodes } from "./util/cheatcodes";

export const DEV = import.meta.env.PRI_DEV === "true";
export const DEV_CHAIN = import.meta.env.PRI_CHAIN_ID === "dev";

export default function AppLoadingState() {
  const initialized = useInit();
  const mud = useMud();
  const [balance, setBalance] = useState<bigint>();
  const time = components.Time.use()?.value;

  useEffect(() => {
    const updateBalance = async () => {
      if (DEV_CHAIN || !time || (balance ?? 0n) > minEth) return;
      const bal = await mud.network.publicClient.getBalance({ address: mud.network.address });
      setBalance(bal);
    };
    updateBalance();
  }, [time, balance, mud.network.address, mud.network.publicClient, minEth]);

  const loadingState = components.SyncProgress.use(undefined, {
    message: "Connecting",
    percentage: 0,
    step: SyncStep.INITIALIZE,
    latestBlockNumber: BigInt(0),
    lastBlockNumberProcessed: BigInt(0),
  });

  const enoughEth = DEV_CHAIN || (balance ?? 0n) >= minEth;
  const loading = loadingState.step !== SyncStep.LIVE || loadingState.percentage < 100;
  const ready = !loading && enoughEth;

  return (
    <div className="bg-black h-screen">
      <div className="absolute w-full h-full star-background opacity-40" />
      <div className="relative">
        {!loading && !enoughEth && (
          <div className="flex flex-col items-center justify-center h-screen text-white font-mono gap-4">
            <p className="text-lg text-white">
              <span className="font-mono">Dripping Eth to Primodium account</span>
              <span>&hellip;</span>
            </p>
            <Progress value={100} max={100} className="animate-pulse w-56" />
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center gap-4">
              <p className="text-lg text-white">
                <span className="font-mono">{loadingState.message}</span>
                {loadingState.percentage > 0 ? (
                  <span className="font-mono">&nbsp;({Math.floor(loadingState.percentage)}%)</span>
                ) : (
                  <span>&hellip;</span>
                )}
              </p>
              {loadingState.percentage === 0 ? (
                <Progress value={100} max={100} className="animate-pulse w-56" />
              ) : (
                <Progress value={loadingState.percentage} max={100} className="w-56" />
              )}
            </div>
          </div>
        )}
        {ready && (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/game" element={initialized ? <Game /> : <Landing />} />
              <Route path="/increment" element={<Increment />} />
              <Route path="/account" element={<Account />} />
              <Route path="/statistics" element={<Statistics />} />
            </Routes>
          </BrowserRouter>
        )}
        {DEV && (
          <Browser
            layers={{ react: { world, components: mud.components } }}
            setContractComponentValue={mud.contractCalls.setComponentValue}
            world={world}
            cheatcodes={setupCheatcodes(mud)}
          />
        )}
      </div>
    </div>
  );
}
