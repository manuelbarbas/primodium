import { useCallback } from "react";
import { Coord } from "@latticexyz/utils";

import { execute } from "../../network/actions";
import { useGameStore } from "../../store/GameStore";
import Spinner from "../shared/Spinner";
import { useNotificationStore } from "../../store/NotificationStore";
import { GameButton } from "../shared/GameButton";
import { useMud } from "src/hooks/useMud";

export default function ClaimButton({
  id,
  coords: { x, y },
}: {
  id?: string;
  coords: Coord;
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
      systems["system.ClaimFromMine"].executeTyped(
        {
          x: x,
          y: y,
        },
        {
          gasLimit: 5_000_000,
        }
      ),
      providers,
      setNotification
    );

    setTransactionLoading(false);
  }, []);

  return (
    <div className="relative">
      <GameButton id={id} className="mt-2 text-sm" onClick={claimAction}>
        <div className="font-bold leading-none h-8 flex justify-center items-center crt px-2 w-40">
          {transactionLoading ? <Spinner /> : "Claim Resources"}
        </div>
      </GameButton>
    </div>
  );
}
