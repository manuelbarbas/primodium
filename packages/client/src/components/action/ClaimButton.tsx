import { useCallback, useMemo } from "react";
import { EntityID } from "@latticexyz/recs";

import { useMud } from "../../context/MudContext";
import { BlockType, DisplayTile } from "../../util/constants";
import { execute } from "../../network/actions";
import { useGameStore } from "../../store/GameStore";
import Spinner from "../Spinner";

export default function ClaimButton({
  id,
  coords: { x, y },
  builtTile,
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
      providers
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
      providers
    );
    setTransactionLoading(false);
  }, []);

  const claimText = useMemo(() => {
    if (builtTile === BlockType.MainBase) {
      return "Claim to Inventory";
    } else {
      return "Claim to Storage";
    }
  }, [builtTile]);

  if (transactionLoading) {
    return (
      <button
        id={id}
        className="inset-x-4 absolute bottom-4 h-10 bg-blue-600 hover:bg-blue-700 text-sm rounded font-bold"
      >
        <Spinner />
      </button>
    );
  } else {
    return (
      <button
        id={id}
        className="inset-x-4 absolute bottom-4 h-10 bg-blue-600 hover:bg-blue-700 text-sm rounded font-bold"
        onClick={claimAction}
      >
        {claimText}
      </button>
    );
  }
}
