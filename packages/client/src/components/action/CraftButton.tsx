import { useCallback } from "react";

import { Coord } from "@latticexyz/utils";

import { useMud } from "../../context/MudContext";
import { execute } from "../../network/actions";
import { useGameStore } from "../../store/GameStore";
import Spinner from "../Spinner";
import { useNotificationStore } from "../../store/NotificationStore";

export default function CraftButton({ coords: { x, y } }: { coords: Coord }) {
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
      <div className="absolute inset-x-4 bottom-16">
        <button className="h-10 bg-yellow-800 hover:bg-yellow-900 text-sm rounded font-bold w-full">
          <Spinner />
        </button>
      </div>
    );
  } else {
    return (
      <div className="absolute inset-x-4 bottom-16">
        <button
          className="h-10 bg-yellow-800 hover:bg-yellow-900 text-sm rounded font-bold w-full"
          onClick={claimAction}
        >
          Craft from Storage
        </button>
      </div>
    );
  }
}
