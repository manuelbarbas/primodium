import { wagmiConfig } from "src/util/web3/wagmi";
import { WagmiConfig } from "wagmi";
import { Connect } from "../components/transfer/Connect";
import { ControlPanel } from "../components/transfer/ControlPanel";

export const Transfer = () => (
  <WagmiConfig config={wagmiConfig}>
    <div className="flex flex-col justify-center items-center w-screen h-screen bg-neutral font-mono">
      <Connect />
      <ControlPanel />
    </div>
  </WagmiConfig>
);
