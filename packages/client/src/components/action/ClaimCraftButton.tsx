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
      <button
        id={id}
        className="inset-x-4 absolute bottom-4 h-10 bg-yellow-800 hover:bg-yellow-900 text-sm rounded font-bold"
      >
        <Spinner />
      </button>
    );
  } else {
    return (
      <button
        id={id}
        className="inset-x-4 absolute bottom-4 h-10 bg-yellow-800 hover:bg-yellow-900 text-sm rounded font-bold"
        onClick={claimAction}
      >
        Claim & Craft to Storage
      </button>
    );
  }
}
