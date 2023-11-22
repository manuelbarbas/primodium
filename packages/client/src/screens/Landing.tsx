import { AnimatePresence, motion } from "framer-motion";
import { MouseEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GameButton } from "src/components/shared/GameButton";
import { useMud } from "src/hooks/useMud";
import { components } from "src/network/components";
import { spawn } from "src/util/web3/contractCalls/spawn";

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
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
        className="flex items-center justify-center h-screen text-white font-mono"
      >
        <div className="text-center space-y-2">
          <div className="flex gap-2 p-4 mb-2 items-center">
            <img src={"img/ios/mainbase-large-icon.png"} className={`w-20 h-20 pixel-images rounded-md`} />
            <h1 className="text-8xl font-bold text-gray-300 stroke-cyan-400">Primodium</h1>
          </div>

          {!message && (
            <GameButton onClick={handlePlay}>
              <p className="px-6 py-2 text-2xl">Play</p>
            </GameButton>
          )}
          <p className="text-lg px-6 py-2">{message}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
