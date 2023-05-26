import { useCallback } from "react";
import { useMud } from "../../context/MudContext";
import { DisplayTile } from "../../util/constants";
import { execute } from "../../network/actions";
import { useGameStore } from "../../store/GameStore";

export default function CraftButton({ x, y }: DisplayTile) {
  const { systems, providers } = useMud();
  const [setTransactionLoading] = useGameStore((state) => [
    state.setTransactionLoading,
  ]);

  const claimAction = useCallback(async () => {
    setTransactionLoading(true);
    await execute(
      systems["system.Craft"].executeTyped({
        x: x,
        y: y,
      }),
      providers
    );
    setTransactionLoading(false);
  }, []);

  return (
    <button
      className="inset-x-4 absolute bottom-16 h-10 bg-yellow-800 hover:bg-yellow-900 text-sm rounded font-bold"
      onClick={claimAction}
    >
      Craft from Storage
    </button>
  );
}
