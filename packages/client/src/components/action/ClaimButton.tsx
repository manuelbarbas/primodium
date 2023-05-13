import { useCallback } from "react";
import { useMud } from "../../context/MudContext";
import { DisplayTile } from "../../util/constants";
import { execute } from "../../network/actions";
import { useTransactionLoading } from "../../context/TransactionLoadingContext";

export default function ClaimButton({ x, y }: DisplayTile) {
  const { systems, providers } = useMud();
  const { setTransactionLoading } = useTransactionLoading();

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

  return (
    <button
      className="inset-x-4 absolute bottom-4 h-10 bg-blue-600 hover:bg-blue-700 text-sm rounded font-bold"
      onClick={claimAction}
    >
      Claim
    </button>
  );
}
