import { Routes, Route, BrowserRouter } from "react-router-dom";

import { SyncState } from "@latticexyz/network";

import Increment from "./screens/Increment";
import Map from "./screens/Map";
import { Game } from "./screens/Game";
import { LoadingState } from "./network/components/chainComponents";

export default function AppLoadingState() {
  // setup loading component, after setting up the network layer and syncing the block state (per emojimon)
  // Loading state component needs to be below the mud context

  const loadingState = LoadingState.use(undefined, {
    state: SyncState.CONNECTING,
    msg: "Connecting",
    percentage: 0,
  });

  if (loadingState.state !== SyncState.LIVE) {
    return (
      <>
        <div className="flex items-center justify-center h-screen bg-gray-700 text-white font-mono">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Primodium</h1>
            <p className="text-lg">
              {loadingState.msg} ({Math.floor(loadingState.percentage)}%)
            </p>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Game />} />
          <Route path="/increment" element={<Increment />} />
          <Route path="/map" element={<Map />} />
        </Routes>
      </BrowserRouter>
    );
  }
}
