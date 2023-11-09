import { SyncStep } from "@latticexyz/store-sync";
import { Browser } from "@primodiumxyz/mud-game-tools";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useMud } from "./hooks";
import { useInit } from "./hooks/useInit";
import { world } from "./network/world";
import { Increment } from "./screens/Increment";
import { Landing } from "./screens/Landing";
import { setupCheatcodes } from "./util/cheatcodes";
import { Game } from "./screens/Game";
import { components } from "./network/components";
import { Progress } from "./components/core/Progress";

const DEV = import.meta.env.PRI_DEV === "true";

export default function AppLoadingState() {
  const initialized = useInit();
  const mud = useMud();

  const loadingState = components.SyncProgress.use(undefined, {
    message: "Connecting",
    percentage: 0,
    step: SyncStep.INITIALIZE,
    latestBlockNumber: BigInt(0),
    lastBlockNumberProcessed: BigInt(0),
  });

  return (
    <div className=" bg-black h-screen">
      <div className="absolute w-full h-full star-background opacity-50" />
      <div className="relative">
        {loadingState.step !== SyncStep.LIVE && (
          <div className="flex items-center justify-center h-screen text-white font-mono">
            <div className="flex flex-col items-center gap-4">
              <p className="text-lg">{loadingState.message}...</p>
              {loadingState.percentage === 0 ? (
                <Progress value={100} max={100} animatePulse />
              ) : (
                <Progress value={loadingState.percentage} max={100} />
              )}
            </div>
          </div>
        )}
        {loadingState.step === SyncStep.LIVE && (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/game" element={initialized ? <Game /> : <Landing />} />
              <Route path="/increment" element={<Increment />} />
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
