import { Scenes } from "@game/constants";
import { memo } from "react";
import { Pane } from "src/components/core/Pane";
import { useMud } from "src/hooks";
import { AllBlueprints } from "./AllBlueprints";

export const Blueprints = memo(() => {
  const { components } = useMud();
  const mapOpen = components.MapOpen.use()?.value;

  if (mapOpen) return null;

  return (
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
  );
});
