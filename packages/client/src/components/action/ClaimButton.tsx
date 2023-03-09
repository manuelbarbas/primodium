import { useCallback } from "react";
import { useMud } from "../../context/MudContext";
import { DisplayTile } from "../../util/constants";

export default function ClaimButton({ x, y }: DisplayTile) {
  const { systems } = useMud();

  const claimAction = useCallback(() => {
    systems["system.Claim"].executeTyped(
      {
        x: x,
        y: y,
      },
      {
        gasLimit: 30_000_000,
      }
    );
  }, []);

  return (
    <button
      className="inset-x-4 bottom-16 h-10 bg-blue-600 hover:bg-blue-700 text-sm rounded font-bold"
      onClick={claimAction}
    >
      Claim
    </button>
  );
}
