import { AnimatePresence, motion } from "framer-motion";
import { MouseEvent, useState } from "react";
import { FaCopyright } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "src/components/core/Button";
import { useMud } from "src/hooks/useMud";
import { components } from "src/network/components";
import { spawn } from "src/util/web3/contractCalls/spawn";

const params = new URLSearchParams(window.location.search);
export const Landing: React.FC = () => {
  const [message, setMessage] = useState<string | null>();
  const { network } = useMud();
  const playerEntity = network.playerEntity;
  const navigate = useNavigate();
  const location = useLocation();
  const hasSpawned = !!components.Home.use(playerEntity)?.asteroid;

  const handlePlay = async (e: MouseEvent<HTMLButtonElement>) => {
    setMessage("Spawning Player Asteroid...");
    e.preventDefault();
    if (!hasSpawned) {
      try {
        await spawn(network);
      } catch (e) {
        console.log(e);
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
        animate={{ scale: 1, opacity: 1, y: 0, transition: { delay: 0.25, duration: 1.5 } }}
        className="flex items-center justify-center h-screen text-white font-mono"
      >
        <div className="relative text-center space-y-2 p-6 bg-neutral/50 border border-secondary flex flex-col items-center justify-center gap-2">
          <h1 className="text-8xl font-bold uppercase font-arial text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-pink-300 stroke stroke-white stroke-4">
            Primodium
          </h1>

          {!message && (
            <Button onClick={handlePlay} className="btn-secondary w-4/5">
              Enter
            </Button>
          )}
          {message && <p className="text-lg">{message}</p>}
          <div className="absolute bottom-0 right-0">
            {params.get("version") ?? ""}{" "}
            {import.meta.env.PRI_VERCEL_GIT_COMMIT_SHA ? import.meta.env.PRI_VERCEL_GIT_COMMIT_SHA.slice(0, 7) : ""}
          </div>
        </div>
      </motion.div>
      <div className="fixed bottom-10 w-screen left-0 text-center flex flex-row justify-center items-center gap-2">
        <FaCopyright /> Primodium 2023
      </div>
    </AnimatePresence>
  );
};
