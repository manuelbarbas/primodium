import { Browser as ECSBrowser } from "@latticexyz/ecs-browser";
import { Layer } from "@latticexyz/recs";
import { useState } from "react";
import { useMud } from "src/context/MudContext";
import components from "src/network/components";
import { world } from "src/network/world";

export const ComponentBrowser = () => {
  const { dev } = useMud();
  const [isVisible, setIsVisible] = useState(false);

  const layer: Layer = {
    world,
    components,
  };

  return (
    <div className="z-10 fixed bottom-0 right-0 w-96 h-full text-xs">
      {isVisible && (
        <ECSBrowser
          world={world}
          layers={{ react: layer }}
          devHighlightComponent={dev.DevHighlightComponent}
          hoverHighlightComponent={dev.HoverHighlightComponent}
          setContractComponentValue={dev.setContractComponentValue}
        />
      )}
      <button
        className="fixed bottom-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? "Hide" : "Show"} Browser
      </button>
    </div>
  );
};
