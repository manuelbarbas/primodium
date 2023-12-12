import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaRegCopyright } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "src/components/core/Button";
import { useMud } from "src/hooks/useMud";
import { components } from "src/network/components";
import { EntityType, ResourceImage } from "src/util/constants";
import { spawn } from "src/util/web3/contractCalls/spawn";

const params = new URLSearchParams(window.location.search);
export const Landing: React.FC = () => {
  const [message, setMessage] = useState<string | null>();
  const { network } = useMud();
  const playerEntity = network.playerEntity;
  const navigate = useNavigate();
  const location = useLocation();
  const hasSpawned = !!components.Home.use(playerEntity)?.asteroid;

  const handlePlay = async () => {
    setMessage("Spawning Player Asteroid...");
    if (!hasSpawned) {
      try {
        await spawn(network);
      } catch {
        setMessage("Failed to spawn asteroid...Retry");
      }
    }

    navigate("/game" + location.search);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="play"
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.5 } }}
        className="flex items-center justify-center h-screen text-white font-mono"
      >
        <div className="relative text-center border border-secondary/25 px-24 py-16 bg-neutral/50 flex flex-col items-center justify-around gap-2">
          <div className="absolute top-0 w-full h-full topographic-background2 opacity-25" />
          <h1 className="text-8xl font-bold uppercase stroke stroke-white stroke-4 z-10">Primodium</h1>
          <h1 className="text-8xl font-bold uppercase text-secondary z-10 -mt-24 opacity-75 z-0">Primodium</h1>

          {!message && (
            <div className="w-4/5 relative flex flex-col items-center gap-2 h-40">
              <img
                src={"/img/mainbase.png"}
                className=" w-32 pixel-images opacity-75 scale-x-[-1] z-0 drop-shadow-2xl absolute bottom-6 margin-auto z-20"
              />
              <div className="absolute bg-gray-800/60 blur-[5px] w-40 h-32 margin-auto bottom-0 z-10" />
            </div>
          )}
          {message ? (
            <p className="text-lg">{message}</p>
          ) : (
            <Button
              onClick={async () => {
                await handlePlay();
              }}
              className="btn-secondary w-4/5 star-background hover:scale-125 relative z-10 drop-shadow-2xl mt-4"
            >
              enter
            </Button>
          )}
          <div className="absolute bottom-0 right-0 p-2 font-bold opacity-50">
            {params.get("version") ?? ""}{" "}
            {import.meta.env.PRI_VERCEL_GIT_COMMIT_SHA ? import.meta.env.PRI_VERCEL_GIT_COMMIT_SHA.slice(0, 7) : ""}
          </div>
          {/* SHIPS */}
          <motion.img
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
          <div className="w-full h-full absolute top-0 overflow-hidden"></div>
        </div>
      </motion.div>
      <div className="fixed bottom-10 w-screen left-0 text-center flex flex-row justify-center items-center gap-2 font-mono uppercase font-bold">
        <FaRegCopyright size={12} /> 2023 Primodium
      </div>
    </AnimatePresence>
  );
};
