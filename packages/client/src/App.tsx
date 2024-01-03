import { useEffect } from "react";
import "react-toastify/dist/ReactToastify.min.css";
import { WagmiConfig } from "wagmi";
import App2 from "./App2";
import { ampli } from "./ampli";
import { Connect } from "./components/transfer/Connect";
import { Maintenance } from "./screens/Maintenance";
import { wagmiConfig } from "./util/web3/wagmi";

const DEV = import.meta.env.PRI_DEV === "true";
const MAINTENANCE = import.meta.env.PRI_MAINTENANCE === "true";

export default function App() {
  // Amplitude Analytics
  useEffect(() => {
    if (DEV) {
      ampli.load({ client: { apiKey: import.meta.env.PRI_AMPLI_API_KEY_DEV } });
    } else {
      ampli.load({ client: { apiKey: import.meta.env.PRI_AMPLI_API_KEY_PROD } });
    }
  }, []);

  if (MAINTENANCE) return <Maintenance />;

  return (
    <WagmiConfig config={wagmiConfig}>
      <Connect />
      <App2 />
    </WagmiConfig>
  );
}
