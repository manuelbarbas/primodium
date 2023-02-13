import { Routes, Route, BrowserRouter } from "react-router-dom";

import { WagmiConfig, createClient } from "wagmi";
import { getDefaultProvider } from "ethers";

import Home from "./screens/Home";
import Increment from "./screens/Increment";
import Map from "./screens/Map";
import LeafletMapDebug from "./screens/LeafletMapDebug";
import SelectedTileProvider from "./context/SelectedTileContext";

import { MudRouterProps } from "./util/types";
import MudProvider from "./context/MudContext";

const wagmiClient = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
});

export default function App({ world, systems, components }: MudRouterProps) {
  return (
    <MudProvider world={world} systems={systems} components={components}>
      <WagmiConfig client={wagmiClient}>
        <SelectedTileProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/increment" element={<Increment />} />
              <Route path="/map" element={<Map />} />
              <Route path="/leaflet" element={<LeafletMapDebug />} />
            </Routes>
          </BrowserRouter>
        </SelectedTileProvider>
      </WagmiConfig>
    </MudProvider>
  );
}
