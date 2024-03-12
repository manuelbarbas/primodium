import { Scenes } from "@game/constants";
import { CheatcodesList } from "@primodiumxyz/mud-game-tools";
import { Widget } from "src/components/core/Widget";
import { useMud } from "src/hooks";
import { usePrimodium } from "src/hooks/usePrimodium";
import { setupCheatcodes } from "src/util/cheatcodes";
import { getRandomRange } from "src/util/common";

export const Cheatcodes = () => {
  const DEV = import.meta.env.PRI_DEV === "true";
  const mud = useMud();
  const primodium = usePrimodium();
  const input = primodium.api(Scenes.UI).input;
  const input2 = primodium.api(Scenes.Asteroid).input;
  const input3 = primodium.api(Scenes.Starmap).input;

  if (!DEV) return null;

  return (
    <div
      className="font-mono"
      onMouseEnter={() => {
        input.disableInput();
        input2.disableInput();
        input3.disableInput();
      }}
      onMouseLeave={() => {
        input.enableInput();
        input2.enableInput();
        input3.enableInput();
      }}
    >
      <Widget
        id="cheatcodes"
        title="CHEATCODES"
        icon="/img/icons/trollface.png"
        defaultCoord={{
          x: window.innerWidth / 2 + getRandomRange(-50, 50),
          y: window.innerHeight / 2 + getRandomRange(-50, 50),
        }}
        scene={Scenes.UI}
        minOpacity={0.5}
        draggable
        lockable
        pinnable
        persist
      >
        <CheatcodesList cheatcodes={setupCheatcodes(mud, primodium)} className="h-[700px] w-[500px] font-mono" />
      </Widget>
    </div>
  );
};
