import { useCallback, useMemo } from "react";
import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";

import { useMud } from "../../context/MudContext";
import { BlockType } from "../../util/constants";
import { execute } from "../../network/actions";
import { useGameStore } from "../../store/GameStore";
import Spinner from "../Spinner";
import { useNotificationStore } from "../../store/NotificationStore";

export default function UpgradeButton({
  id,
  coords: { x, y },
  builtTile,
}: {
  id: string;
  coords: Coord;
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
      systems["system.Upgrade"].executeTyped(
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
    setTransactionLoading(false);
  }, []);

  const claimText = useMemo(() => {
    return "Upgrade Building";
  }, [builtTile]);

  const colorCode = useMemo(() => {
    return "bg-yellow-800 hover:bg-yellow-900";
  }, [builtTile]);

  if (transactionLoading) {
    return (
      <div className="absolute inset-x-3 bottom-3">
        <button
          id={id}
          className={`h-10 ${colorCode} text-sm rounded font-bold w-full`}
        >
          <Spinner />
        </button>
      </div>
    );
  } else {
    return (
      <div className="absolute inset-x-4 bottom-">
        <button
          id={id}
          className={`h-10 ${colorCode} text-sm rounded font-bold w-full`}
          onClick={claimAction}
        >
          {claimText}
        </button>
      </div>
    );
  }
}
