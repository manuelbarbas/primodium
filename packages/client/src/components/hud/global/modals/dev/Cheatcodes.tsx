import { useGame } from "@/react/hooks/useGame";
import { CheatcodesList } from "@primodiumxyz/mud-game-tools";
import { useMud } from "src/hooks";
import { setupCheatcodes } from "src/util/cheatcodes/cheatcodes";

export const Cheatcodes = () => {
  const DEV = import.meta.env.PRI_DEV === "true";
  const mud = useMud();
  const game = useGame();

  if (!DEV) return null;

  return (
    <div className="font-mono w-full h-full overflow-y-auto scrollbar pointer-events-auto z-[1000000]">
      <div className="overflow-y-auto">
        <CheatcodesList cheatcodes={setupCheatcodes(mud, game)} />
      </div>
    </div>
  );
};
