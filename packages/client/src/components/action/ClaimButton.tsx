import { Coord } from "@latticexyz/utils";
import { useGameStore } from "../../store/GameStore";
import { GameButton } from "../shared/GameButton";
import { claimFromMine } from "src/util/web3";
import { useMud } from "src/hooks";
import Spinner from "../shared/Spinner";

export default function ClaimButton({
  id,
  coord,
}: {
  id?: string;
  coord: Coord;
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
        onClick={() => claimFromMine(coord, network)}
      >
        <div className="font-bold leading-none h-8 flex justify-center items-center crt px-2 w-40">
          {transactionLoading ? <Spinner /> : "Claim Resources"}
        </div>
      </GameButton>
    </div>
  );
}
