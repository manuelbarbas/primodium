import { useContractCalls } from "@/hooks/useContractCalls";
import { useGame } from "@/hooks/useGame";
import { useCore } from "@primodiumxyz/core/react";
import { CheatcodesList } from "@primodiumxyz/mud-game-tools";
import { setupCheatcodes } from "@/util/cheatcodes/cheatcodes";

export const Cheatcodes = () => {
  const DEV = import.meta.env.PRI_DEV === "true";
  const mud = useCore();
  const accountClient = useAccountClient();
  const game = useGame();
  const calls = useContractCalls();

  if (!DEV) return null;

  return (
    <div className="font-mono w-full h-full overflow-y-auto scrollbar pointer-events-auto z-[1000000]">
      <div className="overflow-y-auto">
        <CheatcodesList cheatcodes={setupCheatcodes(mud, accountClient, calls, game)} />
      </div>
    </div>
  );
};
