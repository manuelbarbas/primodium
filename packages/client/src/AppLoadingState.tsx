import { SyncStep } from "@latticexyz/store-sync";
import { Browser as ECSBrowser } from "ecs-browser";
import CheatcodesList from "./components/dev/CheatcodesList";
import { useMud } from "./hooks";
import { useInit } from "./hooks/useInit";
import { world } from "./network/world";
import { Increment } from "./screens/Increment";
import { setupCheatcodes } from "./util/cheatcodes";

const DEV = import.meta.env.PRI_DEV === "true";

export default function AppLoadingState() {
  const mud = useMud();
  const { components } = mud;
  useInit();

  const loadingState = components.SyncProgress.use(undefined, {
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
      {loadingState.step !== SyncStep.LIVE && (
        <div className="flex items-center justify-center h-screen text-white font-mono">
          <div className="flex flex-col items-center">
            {/* <h1 className="text-4xl font-bold mb-4">Primodium</h1> */}
            <div className="w-72 ring-2 ring-cyan-400 h-4 relative mb-4">
              <div style={{ width: `${loadingState.percentage}%` }} className="absolute top-0 left-0 bg-cyan-700 h-4" />
            </div>
            <p className="text-lg">
              {loadingState.message} ({Math.floor(loadingState.percentage)}%)
            </p>
          </div>
        </div>
      )}
      {loadingState.step === SyncStep.LIVE && <Increment />}
      {/* {loadingState.step === SyncStep.LIVE && (
        <BrowserRouter>
          <Routes>
            <Route path="/game" element={initialized ? <Game /> : <Landing />} />
            <Route path="/increment" element={<Increment />} />
            <Route path="/map" element={<Map />} />
          </Routes>
        </BrowserRouter>
      )} */}
      {DEV && (
        <ECSBrowser
          world={world}
          layers={{
            react: {
              world,
              components,
            },
          }}
          setField={mud.contractCalls.setFields}
          devHighlightComponent={components.DevHighlight}
          tabs={[{ name: "Cheatcodes", component: <CheatcodesList cheatcodes={setupCheatcodes(mud)} /> }]}
        />
      )}
    </div>
  );
}
