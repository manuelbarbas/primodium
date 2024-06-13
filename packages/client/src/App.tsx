import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { WagmiProvider } from "wagmi";
import { Connect } from "./Connect";
import { ampli } from "./ampli";
import { usePersistentStore } from "./game/stores/PersistentStore";
import { Maintenance } from "./screens/Maintenance";
import { wagmiConfig } from "@/config/wagmiConfig";
import { cn } from "@/util/client";
import Core from "@/Core";

const DEV = import.meta.env.PRI_DEV === "true";
const MAINTENANCE = import.meta.env.PRI_MAINTENANCE === "true";

const queryClient = new QueryClient();

export default function App() {
  const fontStyle = usePersistentStore((state) => state.fontStyle);
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
    <div className={cn("bg-black", fontStyle)}>
      <div className="absolute top-0 w-full min-h-full star-background opacity-30" />
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ToastContainer
            toastClassName={`text-xs border bg-neutral border-secondary rounded-box ${fontStyle}`}
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
          <Core />
        </QueryClientProvider>
      </WagmiProvider>
      <div id="modal-root" className="fixed top-0 pointer-events-auto z-50" />
    </div>
  );
}
