import { AnimatePresence, motion } from "framer-motion";
import { chunk } from "lodash";
import { useEffect, useState } from "react";
import { FaExclamationTriangle, FaRegCopyright } from "react-icons/fa";
import { toast } from "react-toastify";
import { EntityType, ResourceImage } from "src/util/constants";
import { useAccount, useConnect } from "wagmi";
import { usePersistentStore } from "./game/stores/PersistentStore";

const params = new URLSearchParams(window.location.search);

const connectorIcons: Record<string, string> = {
  ["MetaMask"]: "/img/icons/web3/metamask.svg",
  ["WalletConnect"]: "/img/icons/web3/walletconnect.svg",
  ["Coinbase Wallet"]: "/img/icons/web3/coinbase.svg",
};

export const Connect: React.FC = () => {
  const { connector, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { noExternalWallet, setNoExternalWallet } = usePersistentStore();
  const [showingToast, setShowingToast] = useState(false);

  useEffect(() => {
    if (error) toast.warn(error.message);
  }, [error]);

  const confirmToast = async () => {
    toast.dismiss();
    if (showingToast) await new Promise((resolve) => setTimeout(resolve, 500));
    setShowingToast(true);
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col text-center justify-center items-center gap-2 w-full">
            <FaExclamationTriangle size={24} className="text-warning" />
            Are you sure you want to play as guest? You will not be able to win prizes or play across devices.
          </div>

          <div className="flex justify-center w-full gap-2">
            <button
              className="btn btn-secondary btn-xs"
              onClick={() => {
                setNoExternalWallet(true);
                closeToast && closeToast();
              }}
            >
              Confirm
            </button>
            <button
              onClick={() => {
                setShowingToast(false);
                closeToast && closeToast();
              }}
              className="btn btn-primary btn-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        // className: "border-error",
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        hideProgressBar: true,
      }
    );
  };

  if (isConnected || noExternalWallet) return null;

  return (
    <AnimatePresence key="animate-1">
      <div key="bg" className="absolute w-full h-full bg-black" />
      <div key="star" className="absolute w-full h-full star-background opacity-30" />
      <motion.div
        key="play"
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.5 } }}
        className="flex items-center justify-center h-screen text-white font-mono"
      >
        <div className="relative text-center border border-secondary/25 px-24 py-16 bg-neutral/50 flex flex-col items-center gap-2 mb-4">
          <div className="absolute top-0 w-full h-full topographic-background2 opacity-25" />
          <h1 className="text-8xl font-bold uppercase stroke stroke-white stroke-4 z-10">Primodium</h1>
          <h1 className="text-8xl font-bold uppercase text-accent z-5 -mt-[6.2rem] opacity-75 z-1">Primodium</h1>
          <h1 className="text-8xl font-bold uppercase text-secondary -mt-[6.15rem] opacity-75 z-0">Primodium</h1>
          <div className="w-4/5 relative flex flex-col items-center gap-2 h-40">
            <img
              src={"/img/mainbase.png"}
              className=" w-32 pixel-images opacity-75 scale-x-[-1] absolute bottom-6 margin-auto z-20"
            />
            <div className="absolute bg-gray-900 blur-[15px] w-56 h-32 margin-auto bottom-0 z-10" />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <button
              className="btn-lg btn-secondary star-background w-full btn join-item inline pointer-events-auto font-bold outline-none h-fit z-10"
              onClick={confirmToast}
            >
              Play as Guest
            </button>

            {chunk(
              connectors.filter((x) => x.ready && x.id !== connector?.id),
              2
            ).map((chunk, i) => (
              <div key={`chunk-${i}`} className="flex flex-row gap-2">
                {chunk.map((x) => (
                  <button
                    className="flex-1 items-center justify-center btn btn-secondary star-background join-item inline pointer-events-auto font-bold outline-none h-fit z-10"
                    key={`${x.id}-${x.name}`}
                    onClick={() => !isLoading && connect({ connector: x })}
                    disabled={isLoading && x.id !== pendingConnector?.id}
                  >
                    <div className="flex w-full items-center justify-center gap-2">
                      {connectorIcons[x.name] && <img src={connectorIcons[x.name]} className="w-6 h-6" />}
                      {x.name}
                      {isLoading && x.id === pendingConnector?.id && <p className="text-xs">(connecting)</p>}
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 right-0 p-2 font-bold opacity-50">
            {params.get("version") ?? ""}
            {import.meta.env.PRI_VERCEL_GIT_COMMIT_SHA ? import.meta.env.PRI_VERCEL_GIT_COMMIT_SHA.slice(0, 7) : ""}
          </div>
          {/* SHIPS */}
          <motion.img
            key="ship1"
            initial={{ x: "50%", y: "-50%" }}
            animate={{
              y: "-45%",
              x: "44%",
              transition: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: 4,
                delay: 0.5,
              },
            }}
            src={ResourceImage.get(EntityType.StingerDrone)}
            className="absolute top-0 right-0 p-0 w-32 pixel-images opacity-75"
          />
          <motion.img
            key="ship2"
            initial={{ x: "50%", y: "-50%" }}
            animate={{
              y: "-53%",
              x: "47%",
              transition: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: 2,
                delay: 1,
              },
            }}
            src={ResourceImage.get(EntityType.StingerDrone)}
            className="absolute -top-10 -right-24 p-0 w-14 pixel-images opacity-25"
          />
          <motion.img
            key="ship3"
            initial={{ x: "50%", y: "-50%" }}
            animate={{
              y: "-53%",
              x: "53%",
              transition: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: 3,
                delay: 0,
              },
            }}
            src={ResourceImage.get(EntityType.HammerDrone)}
            className="absolute top-10 -right-24 translate-x-full -translate-y-1/2 p-0 w-16 pixel-images opacity-50"
          />
          <motion.img
            key="ship4"
            initial={{ x: "-100%", y: "-50%", scaleX: "-100%" }}
            animate={{
              y: "-45%",
              x: "-96%",
              transition: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: 5,
                delay: 0,
              },
            }}
            src={ResourceImage.get(EntityType.MiningVessel)}
            className="absolute -top-0 left-10 p-0 w-44 pixel-images scale-x-[-1]"
          />
        </div>
      </motion.div>
      <div
        key="copyright"
        className="fixed bottom-10 w-screen left-0 text-center flex flex-row justify-center items-center gap-2 font-mono uppercase font-bold"
      >
        <FaRegCopyright size={12} /> 2023 Primodium
      </div>
    </AnimatePresence>
  );
};
