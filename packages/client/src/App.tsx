import { Routes, Route, BrowserRouter } from "react-router-dom";

import { WagmiConfig, createClient } from "wagmi";
import { getDefaultProvider } from "ethers";

import { TxQueue } from "@latticexyz/network";
import { World } from "@latticexyz/recs";
import { SystemTypes } from "contracts/types/SystemTypes";
import { components } from ".";

import Home from "./screens/Home";
import Increment from "./screens/Increment";
import Map from "./screens/Map";

type Props = {
  world: World;
  systems: TxQueue<SystemTypes>;
  components: typeof components;
};

const wagmiClient = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
});

export default function App({ world, systems, components }: Props) {
  return (
    <WagmiConfig client={wagmiClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/increment"
            element={
              <Increment
                world={world}
                systems={systems}
                components={components}
              />
            }
          />
          <Route
            path="/map"
            element={
              <Map world={world} systems={systems} components={components} />
            }
          />
        </Routes>
      </BrowserRouter>
    </WagmiConfig>
  );
}
