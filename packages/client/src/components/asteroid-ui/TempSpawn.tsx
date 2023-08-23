import { FC, MouseEvent } from "react";
import { useAccount, useMud } from "src/hooks";
import { Position } from "src/network/components/chainComponents";
import { spawn } from "src/util/web3/spawn";

const TempSpawn: FC = () => {
  const network = useMud();
  const { address } = useAccount();
  const hasSpawned = !!Position.use(address);

  const handleSpawn = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    spawn(network);
  };

  if (hasSpawned) return null;

  return (
    <div className="fixed top-0 left-0 flex items-center justify-center w-screen h-screen bg-white z-[1001]">
      <button
        onClick={handleSpawn}
        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
      >
        Spawn
      </button>
    </div>
  );
};

export default TempSpawn;
