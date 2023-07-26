import { Coord } from "@latticexyz/utils";
import { useMud } from "src/context/MudContext";
import { useGameStore } from "../../store/GameStore";
import Spinner from "../Spinner";
import { GameButton } from "../shared/GameButton";
import { claimFromMine } from "src/util/web3";

export default function ClaimButton({
  id,
  coords,
}: {
  id?: string;
  coords: Coord;
}) {
  const network = useMud();
  const [transactionLoading] = useGameStore((state) => [
    state.transactionLoading,
  ]);

  return (
    <div className="relative">
      <GameButton
        id={id}
        className="mt-2 text-sm"
        onClick={() => claimFromMine(coords, network)}
      >
        <div className="font-bold leading-none h-8 flex justify-center items-center crt px-2 w-40">
          {transactionLoading ? <Spinner /> : "Claim Resources"}
        </div>
      </GameButton>
    </div>
  );
}
