import { useCallback } from "react";
import { execute } from "../network/actions";
import { useMud } from "../context/MudContext";
import { useTransactionLoading } from "../context/TransactionLoadingContext";

export default function StarterPackButton() {
  const { systems, providers } = useMud();
  const { setTransactionLoading } = useTransactionLoading();

  const claimStarterPack = useCallback(async () => {
    setTransactionLoading(true);
    await execute(
      systems["system.StarterPackSystem"].executeTyped({
        gasLimit: 1_000_000,
      }),
      providers
    );
    setTransactionLoading(false);
  }, []);

  return (
    <button
      onClick={claimStarterPack}
      className="absolute inset-x-4 bottom-4 h-10 bg-green-600 hover:bg-green-700 text-sm rounded font-bold"
    >
      Claim 200 Iron
    </button>
  );
}
