import { useCallback } from "react";
import { execute } from "../network/actions";
import { useMud } from "../context/MudContext";
import { useGameStore } from "../store/GameStore";
import { useNotificationStore } from "../store/NotificationStore";
import Spinner from "./Spinner";

export default function StarterPackButton() {
  const { systems, providers } = useMud();
  const [transactionLoading, setTransactionLoading] = useGameStore((state) => [
    state.transactionLoading,
    state.setTransactionLoading,
  ]);
  const [setNotification] = useNotificationStore((state) => [
    state.setNotification,
  ]);

  const claimStarterPack = useCallback(async () => {
    setTransactionLoading(true);
    await execute(
      systems["system.StarterPackSystem"].executeTyped({
        gasLimit: 1_000_000,
      }),
      providers,
      setNotification
    );
    setTransactionLoading(false);
  }, []);

  return (
    <div className="absolute inset-x-4 bottom-4 flex">
      <button
        id="starter-pack-button"
        onClick={claimStarterPack}
        className="h-10 bg-green-600 hover:bg-green-700 text-sm rounded font-bold w-full"
      >
        {transactionLoading ? <Spinner /> : "Claim 200 Iron"}
      </button>
    </div>
  );
}
