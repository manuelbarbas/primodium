import { useCallback } from "react";
import { EntityID } from "@latticexyz/recs";

import { useMud } from "../../context/MudContext";
import { DisplayTile } from "../../util/constants";
import { execute } from "../../network/actions";
import { useGameStore } from "../../store/GameStore";
import Spinner from "../Spinner";
import { useNotificationStore } from "../../store/NotificationStore";

export default function ClaimCraftButton({
  id,
  coords: { x, y },
}: {
  id: string;
  coords: DisplayTile;
  builtTile: EntityID;
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
          gasLimit: 30_000_000,
        }
      ),
      providers,
      setNotification
    );
    await execute(
      systems["system.ClaimFromFactory"].executeTyped(
        {
          x: x,
          y: y,
        },
        {
          gasLimit: 30_000_000,
        }
      ),
      providers,
      setNotification
    );
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
      <div className="absolute inset-x-4 bottom-4">
        <button
          id={id}
          className="h-10 bg-yellow-800 hover:bg-yellow-900 text-sm rounded font-bold w-full"
        >
          <Spinner />
        </button>
      </div>
    );
  } else {
    return (
      <div className="absolute inset-x-4 bottom-4">
        <button
          id={id}
          className="h-10 bg-yellow-800 hover:bg-yellow-900 text-sm rounded font-bold w-full"
          onClick={claimAction}
        >
          Claim & Craft to Storage
        </button>
      </div>
    );
  }
}
