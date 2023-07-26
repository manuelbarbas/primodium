import { Coord } from "@latticexyz/utils";

import { useMud } from "src/hooks/useMud";
import { execute } from "../../network/actions";
import { useGameStore } from "../../store/GameStore";
import Spinner from "../shared/Spinner";
import { useNotificationStore } from "../../store/NotificationStore";

export default function CraftButton({ coords }: { coords: Coord }) {
  const network = useMud();
  const [transactionLoading] = useGameStore((state) => [
    state.transactionLoading,
  ]);

  return (
    <div className="absolute inset-x-4 bottom-16">
      <button
        className="h-10 bg-yellow-800 hover:bg-yellow-900 text-sm rounded font-bold w-full"
        disabled={transactionLoading}
        onClick={() => craft(coords, network)}
      >
        {transactionLoading ? <Spinner /> : "Craft from Storage"}
      </button>
    </div>
  );
}
