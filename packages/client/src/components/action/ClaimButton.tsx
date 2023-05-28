import { useCallback, useMemo } from "react";
import { useMud } from "../../context/MudContext";
import { BlockType, DisplayTile } from "../../util/constants";
import { execute } from "../../network/actions";
import { EntityID } from "@latticexyz/recs";
import { useGameStore } from "../../store/GameStore";

export default function ClaimButton({
  coords: { x, y },
  builtTile,
}: {
  coords: DisplayTile;
  builtTile: EntityID;
}) {
  const { systems, providers } = useMud();
  const [setTransactionLoading] = useGameStore((state) => [
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

  return (
    <button
      className="inset-x-4 absolute bottom-4 h-10 bg-blue-600 hover:bg-blue-700 text-sm rounded font-bold"
      onClick={claimAction}
    >
      {claimText}
    </button>
  );
}
