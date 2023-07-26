import { useMud } from "../context/MudContext";
import { claimStarterPack } from "src/util/web3";
import Spinner from "./Spinner";
import { useGameStore } from "src/store/GameStore";

export default function StarterPackButton() {
  const network = useMud();
  const [transactionLoading] = useGameStore((state) => [
    state.transactionLoading,
  ]);
  return (
    <div className="absolute inset-x-4 bottom-4 flex">
      <button
        id="starter-pack-button"
        onClick={() => claimStarterPack(network)}
        className="h-10 bg-green-600 hover:bg-green-700 text-sm rounded font-bold w-full py-2"
      >
        {transactionLoading ? <Spinner /> : "Claim 200 Iron"}
      </button>
    </div>
  );
}
