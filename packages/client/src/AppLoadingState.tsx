import { Routes, Route, BrowserRouter } from "react-router-dom";

import { SyncState } from "@latticexyz/network";

import Increment from "./screens/Increment";
import Map from "./screens/Map";
import { Game } from "./screens/Game";
import { LoadingState } from "./network/components/chainComponents";
import { Landing } from "./screens/Landing";
import { useInit } from "./hooks/useInit";

export default function AppLoadingState() {
  //initialize global components
  const initialized = useInit();

  // setup loading component, after setting up the network layer and syncing the block state (per emojimon)
  // Loading state component needs to be below the mud context

  const loadingState = LoadingState.use(undefined, {
    state: SyncState.CONNECTING,
    msg: "Connecting",
    percentage: 0,
  });

  return (
    <div
      style={{
        backgroundImage: "url(/img/backgrounds/star.png)",
      }}
    >
      {loadingState.state !== SyncState.LIVE && (
        <div className="flex items-center justify-center h-screen text-white font-mono">
          <div className="flex flex-col items-center">
            {/* <h1 className="text-4xl font-bold mb-4">Primodium</h1> */}
            <div className="w-72 ring-2 ring-cyan-400 h-4 relative mb-4">
              <div
                style={{ width: `${loadingState.percentage}%` }}
                className="absolute top-0 left-0 bg-cyan-700 h-4"
              />
            </div>
            <p className="text-lg">
              {loadingState.msg} ({Math.floor(loadingState.percentage)}%)
            </p>
          </div>
        </div>
      )}
      {loadingState.state === SyncState.LIVE && (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route
              path="/game"
              element={initialized ? <Game /> : <Landing />}
            />
            <Route path="/increment" element={<Increment />} />
            <Route path="/map" element={<Map />} />
          </Routes>
        </BrowserRouter>
      )}
    </div>
  );
}
