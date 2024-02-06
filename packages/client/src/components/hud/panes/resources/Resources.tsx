import { Scenes } from "@game/constants";
import { Pane } from "src/components/core/Pane";
import { AllResourceLabels } from "./AllResourceLabels";
import { memo } from "react";
import { useMud } from "src/hooks";

export const Resources = memo(() => {
  const { components } = useMud();
  const mapOpen = components.MapOpen.use()?.value;

  return (
    <Pane
      id="resources"
      title="ASTEROID RESOURCES"
      defaultCoord={{ x: 26, y: 11 }}
      scene={Scenes.Asteroid}
      origin="center-left"
      minOpacity={0.5}
      draggable
      persist
      pinnable={!mapOpen}
    >
      <AllResourceLabels />
    </Pane>
  );
});
