import { useContractCalls } from "@/hooks/useContractCalls";
import { useGame } from "@/hooks/useGame";
import { useAccountClient, useCore } from "@primodiumxyz/core/react";
import { setupCheatcodes } from "@/util/cheatcodes/cheatcodes";
import { CheatcodesList } from "@/components/hud/global/modals/dev/CheatcodesList";

export const Cheatcodes = () => {
  const DEV = import.meta.env.PRI_DEV === "true";
  const core = useCore();
  const accountClient = useAccountClient();
  const game = useGame();
  const calls = useContractCalls();

  if (!DEV) return null;

  return (
    <div className="font-mono w-full h-full overflow-y-auto scrollbar pointer-events-auto z-[1000000]">
      <div className="overflow-y-auto">
        <CheatcodesList cheatcodes={setupCheatcodes(core, accountClient, calls, game)} />
      </div>
    </div>
  );
};
