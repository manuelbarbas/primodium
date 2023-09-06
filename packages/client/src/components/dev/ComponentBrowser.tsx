import { Layer } from "@latticexyz/recs";
import { Browser as ECSBrowser } from "ecs-browser";
import { useState } from "react";
import { useMud } from "src/hooks";
import { world } from "src/network/world";

export const ComponentBrowser = () => {
  const mud = useMud();
  const [isVisible, setIsVisible] = useState<"browser" | "cheat" | false>(false);

  const layer: Layer = {
    world,
    components: mud.components,
  };

  // const cheatcodes = setupCheatcodes(mud);
  return (
    <div className={`z-[1002] fixed bottom-0 right-0 ${isVisible ? "w-96" : ""} h-full text-xs`}>
      {isVisible === "browser" && (
        <ECSBrowser world={world} layers={{ react: layer }} devHighlightComponent={mud.components.DevHighlight} />
      )}
      {/* {isVisible === "cheat" && <Cheatcodes cheatcodes={cheatcodes} />} */}
      <div className="fixed bottom-0 right-0 flex flex-col gap-1">
        <button
          className="bg-blue-500 text-white text-xs px-2 py-1 rounded"
          onClick={() => setIsVisible(isVisible === "browser" ? false : "browser")}
        >
          {isVisible === "browser" ? "Hide" : "Show"} Browser
        </button>
        <button
          className="bg-blue-500 text-white text-xs px-2 py-1 rounded"
          onClick={() => setIsVisible(isVisible === "cheat" ? false : "cheat")}
        >
          {isVisible === "cheat" ? "Hide" : "Show"} Cheatcodes
        </button>
      </div>
    </div>
  );
};
