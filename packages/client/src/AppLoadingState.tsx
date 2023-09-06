import { BrowserRouter, Route, Routes } from "react-router-dom";

import { SyncStep } from "@latticexyz/store-sync";
import { useMud } from "./hooks";
import { useInit } from "./hooks/useInit";
import Increment from "./screens/Increment";
import { Landing } from "./screens/Landing";

export default function AppLoadingState() {
  //initialize global components
  const initialized = useInit();
  const {
    components: { SyncProgress },
  } = useMud();

  // setup loading component, after setting up the network layer and syncing the block state (per emojimon)
  // Loading state component needs to be below the mud context

  const loadingState = SyncProgress.use(undefined, {
    message: "Connecting",
    percentage: 0,
    step: SyncStep.INITIALIZE,
    latestBlockNumber: 0n,
    lastBlockNumberProcessed: 0n,
  });

  return (
    <div
      style={{
        backgroundImage: "url(/img/backgrounds/star.png)",
      }}
    >
      {loadingState.state !== SyncStep.LIVE && (
        <div className="flex items-center justify-center h-screen text-white font-mono">
          <div className="flex flex-col items-center">
            {/* <h1 className="text-4xl font-bold mb-4">Primodium</h1> */}
            <div className="w-72 ring-2 ring-cyan-400 h-4 relative mb-4">
              <div style={{ width: `${loadingState.percentage}%` }} className="absolute top-0 left-0 bg-cyan-700 h-4" />
            </div>
          </div>
        </div>
      )}
      {loadingState.state === SyncStep.LIVE && (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            {/* <Route path="/game" element={initialized ? <Game /> : <Landing />} /> */}
            <Route path="/increment" element={<Increment />} />
            {/* <Route path="/map" element={<Map />} /> */}
          </Routes>
        </BrowserRouter>
      )}
    </div>
  );
}
