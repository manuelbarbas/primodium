import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { WagmiConfig } from "wagmi";
import { Connect } from "./Connect";
import SetupResultProvider from "./SetupResultProvider";
import { ampli } from "./ampli";
import { NoExternalAccountContextProvider } from "./hooks/useNoExternalAccount";
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
    <NoExternalAccountContextProvider>
      <WagmiConfig config={wagmiConfig}>
        <ToastContainer
          toastClassName={`font-mono text-xs border bg-neutral border-secondary rounded-box`}
          progressClassName={"bg-accent"}
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <Connect />
        <SetupResultProvider />
      </WagmiConfig>
    </NoExternalAccountContextProvider>
  );
}
