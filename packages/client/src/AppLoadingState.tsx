import { BrowserRouter, Route, Routes } from "react-router-dom";

import { useInit } from "./hooks/useInit";
import { LoadingState } from "./network/components/chainComponents";
import { Game } from "./screens/Game";
import Increment from "./screens/Increment";
import { Landing } from "./screens/Landing";

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
    <div className=" bg-black">
      <div className="absolute w-full h-full star-background opacity-50" />
      <div className="relative">
        {loadingState.state !== SyncState.LIVE && (
          <div className="flex items-center justify-center h-screen text-white font-mono">
            <div className="flex flex-col items-center gap-2">
              <Progress value={loadingState.percentage} max={100} />

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
              <Route path="/game" element={initialized ? <Game /> : <Landing />} />
              <Route path="/increment" element={<Increment />} />
            </Routes>
          </BrowserRouter>
        )}
      </div>
    </div>
  );
}
