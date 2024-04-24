import { CheatcodesList } from "@primodiumxyz/mud-game-tools";
import { useMud } from "src/hooks";
import { usePrimodium } from "src/hooks/usePrimodium";
import { setupCheatcodes } from "src/util/cheatcodes/cheatcodes";

export const Cheatcodes = () => {
  const DEV = import.meta.env.PRI_DEV === "true";
  const mud = useMud();
  const primodium = usePrimodium();

  if (!DEV) return null;

  return (
    <div className="font-mono w-full h-full overflow-y-auto scrollbar">
      <CheatcodesList cheatcodes={setupCheatcodes(mud, primodium)} />
    </div>
  );
};
