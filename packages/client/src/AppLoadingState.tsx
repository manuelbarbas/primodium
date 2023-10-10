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

const DEV = import.meta.env.PRI_DEV === "true";

export default function AppLoadingState() {
  const mud = useMud();
  const { components } = mud;
  useInit();

  const loadingState = components.SyncProgress.use(undefined, {
    message: "Connecting",
    percentage: 0,
    step: SyncStep.INITIALIZE,
    latestBlockNumber: BigInt(0),
    lastBlockNumberProcessed: BigInt(0),
  });

  return (
    <div
      style={{
        backgroundImage: "url(/img/backgrounds/star.png)",
      }}
    >
      {loadingState.step !== SyncStep.LIVE && (
        <div className="flex items-center justify-center h-screen text-white font-mono">
          <div className="flex flex-col items-center">
            <div className="w-72 ring-2 ring-cyan-400 h-4 relative mb-4">
              <div style={{ width: `${loadingState.percentage}%` }} className="absolute top-0 left-0 bg-cyan-700 h-4" />
            </div>
            <p className="text-lg">
              {loadingState.message} ({Math.floor(loadingState.percentage)}%)
            </p>
          </div>
        </div>
      )}
      {loadingState.step === SyncStep.LIVE && (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/game" element={<Game />} />
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
  );
}
