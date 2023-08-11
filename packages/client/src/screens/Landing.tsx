import { MouseEvent, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAccount } from "src/hooks";
import { useMud } from "src/hooks/useMud";
import { Position } from "src/network/components/chainComponents";
import { spawn } from "src/util/web3/spawn";

export const Landing: React.FC = () => {
  const [message, setMessage] = useState<string | null>();
  const network = useMud();
  const { address } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const hasSpawned = !!Position.use(address);

  const handlePlay = async (e: MouseEvent<HTMLButtonElement>) => {
    if (hasSpawned) {
      navigate("/game" + location.search);
      return;
    }

    setMessage("Spawning Player Asteroid...");
    e.preventDefault();
    try {
      await spawn(network);
    } catch (e) {
      console.log(e);
      setMessage("Failed to spawn asteroid...Retry");
    }
    navigate("/game" + location.search);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-700 text-white font-mono">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Primodium</h1>
        {!message && (
          <button onClick={handlePlay} className="text-lg">
            Play
          </button>
        )}
        <p className="text-lg">{message}</p>
      </div>
    </div>
  );
};
