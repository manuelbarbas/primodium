import { useCallback } from "react";
import { execute } from "../network/actions";
import { useMud } from "../context/MudContext";
import { useGameStore } from "../store/GameStore";
import { useNotificationStore } from "../store/NotificationStore";

export default function StarterPackButton() {
  const { systems, providers } = useMud();
  const [setTransactionLoading] = useGameStore((state) => [
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
    <button
      id="starter-pack-button"
      onClick={claimStarterPack}
      className="absolute inset-x-4 bottom-4 h-10 bg-green-600 hover:bg-green-700 text-sm rounded font-bold"
    >
      Claim 200 Iron
    </button>
  );
}
