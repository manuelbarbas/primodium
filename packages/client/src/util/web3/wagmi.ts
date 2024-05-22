import { Buffer } from "buffer";
import { getNetworkConfig } from "src/network/config/getNetworkConfig";
import { createClient } from "viem";
import { createConfig, http } from "wagmi";
import { coinbaseWallet, walletConnect } from "wagmi/connectors";

// polyfill Buffer for client
if (!window.Buffer) {
  window.Buffer = Buffer;
}

const env = import.meta.env;
const projectId = env.PRI_WALLETCONNECT_PROJECT_ID;

const chain = getNetworkConfig().chain;

export const wagmiConfig = createConfig({
  chains: [chain],

  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
  connectors: [
    walletConnect({ projectId }),
    coinbaseWallet({ appName: "wagmi" }),
    // injected({target: 'Injected', shimDisconnect: true}),
  ],
});
