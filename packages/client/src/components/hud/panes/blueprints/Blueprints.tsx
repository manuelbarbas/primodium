import { memo } from "react";
import { Scenes } from "@game/constants";
import { Pane } from "src/components/core/Pane";
import { AllBlueprints } from "./AllBlueprints";
import { useMud } from "src/hooks";

export const Blueprints = memo(() => {
  const { components } = useMud();
  const mapOpen = components.MapOpen.use()?.value;

  if (mapOpen) return null;

  return (
    <div>
      <Pane
        id="blueprints"
        title="BLUEPRINTS"
        defaultCoord={{ x: 69, y: 420 }}
        defaultLocked
        defaultPinned
        origin="center"
        scene={Scenes.Asteroid}
        minOpacity={0.6}
        draggable
        pinnable
        persist
      >
        <AllBlueprints />
      </Pane>
    </div>
  );
});
