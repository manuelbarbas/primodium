import { Routes, Route, BrowserRouter } from "react-router-dom";

import { SyncState } from "@latticexyz/network";
import { useComponentValue } from "@latticexyz/react";
import { useMud } from "./context/MudContext";

import Home from "./screens/Home";
import Increment from "./screens/Increment";
import Map from "./screens/Map";
import LeafletMapDebug from "./screens/LeafletMapDebug";

export default function AppLoadingState() {
  // setup loading component, after setting up the network layer and syncing the block state (per emojimon)
  // Loading state component needs to be below the mud context
  const { components, singletonIndex } = useMud();

  const loadingState = useComponentValue(
    components.LoadingState,
    singletonIndex,
    {
      state: SyncState.CONNECTING,
      msg: "Connecting",
      percentage: 0,
    }
  );

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
          <Route path="/" element={<Home />} />
          <Route path="/increment" element={<Increment />} />
          <Route path="/map" element={<Map />} />
          <Route path="/leaflet" element={<LeafletMapDebug />} />
        </Routes>
      </BrowserRouter>
    );
  }
}
