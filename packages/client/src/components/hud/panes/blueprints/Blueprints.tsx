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
    <Pane
      id="blueprints"
      title="BLUEPRINTS"
      defaultCoord={{ x: 11, y: 11.5 }}
      scene={Scenes.Asteroid}
      minOpacity={0.5}
      draggable
      pinnable
      persist
      origin="center-right"
    >
      <AllBlueprints />
    </Pane>
  );
});
