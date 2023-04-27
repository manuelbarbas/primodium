import { useCallback } from "react";
import { execute } from "../network/actions";
import { useMud } from "../context/MudContext";

export default function StarterPackButton() {
  const { systems, providers } = useMud();
  const claimStarterPack = useCallback(async () => {
    await execute(
      systems["system.StarterPackSystem"].executeTyped({
        gasLimit: 30_000_000,
      }),
      providers
    );
  }, []);

  return (
    <button
      onClick={claimStarterPack}
      className="absolute inset-x-4 bottom-4 h-10 bg-green-600 hover:bg-amber-700 text-sm rounded font-bold"
    >
      Claim 200 Iron
    </button>
  );
}
