import { Scenes } from "@game/constants";
import { Pane } from "src/components/core/Pane";
import { AllResourceLabels } from "./AllResourceLabels";
import { memo } from "react";

export const Resources = memo(() => {
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
      pinnable
    >
      <AllResourceLabels />
    </Pane>
  );
});
