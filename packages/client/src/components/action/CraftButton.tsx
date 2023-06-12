import { useCallback } from "react";
import { useMud } from "../../context/MudContext";
import { DisplayTile } from "../../util/constants";
import { execute } from "../../network/actions";
import { useGameStore } from "../../store/GameStore";
import Spinner from "../Spinner";
import { useNotificationStore } from "../../store/NotificationStore";

export default function CraftButton({
  coords: { x, y },
}: {
  coords: DisplayTile;
}) {
  const { systems, providers } = useMud();
  const [transactionLoading, setTransactionLoading] = useGameStore((state) => [
    state.transactionLoading,
    state.setTransactionLoading,
  ]);
  const [setNotification] = useNotificationStore((state) => [
    state.setNotification,
  ]);

  const claimAction = useCallback(async () => {
    setTransactionLoading(true);
    await execute(
      systems["system.Craft"].executeTyped({
        x: x,
        y: y,
      }),
      providers,
      setNotification
    );
    setTransactionLoading(false);
  }, []);

  if (transactionLoading) {
    return (
      <button className="inset-x-4 absolute bottom-16 h-10 bg-yellow-800 hover:bg-yellow-900 text-sm rounded font-bold">
        <Spinner />
      </button>
    );
  } else {
    return (
      <button
        className="inset-x-4 absolute bottom-16 h-10 bg-yellow-800 hover:bg-yellow-900 text-sm rounded font-bold"
        onClick={claimAction}
      >
        Craft from Storage
      </button>
    );
  }
}
