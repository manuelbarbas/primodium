import { AnimatePresence, motion } from "framer-motion";
import { MouseEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMud } from "src/hooks/useMud";
import { components } from "src/network/components";

export const Landing: React.FC = () => {
  const [message, setMessage] = useState<string | null>();
  const {
    contractCalls,
    network: { playerEntity },
  } = useMud();
  const navigate = useNavigate();
  const location = useLocation();
  const hasSpawned = !!components.Home.use(playerEntity)?.asteroid;

  const handlePlay = async (e: MouseEvent<HTMLButtonElement>) => {
    setMessage("Spawning Player Asteroid...");
    e.preventDefault();
    if (!hasSpawned) {
      try {
        await contractCalls.spawn();
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
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
        className="flex items-center justify-center h-screen text-white font-mono"
      >
        <div className="text-center space-y-2">
          <div className="p-4 mb-2">
            <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-cyan-200 to-pink-100 p-4 stroke stroke-slate-200 ">
              Primodium
            </h1>
          </div>

          {!message && (
            <button
              onClick={handlePlay}
              className="text-2xl bg-slate-900 border border-cyan-400 p-2 px-4 hover:bg-cyan-800 hover:scale-105 transition-all"
            >
              Play
            </button>
          )}
          <p className="text-lg">{message}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
