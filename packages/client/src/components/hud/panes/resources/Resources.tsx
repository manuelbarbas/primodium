import { Scenes } from "@game/constants";
import { Pane } from "src/components/core/Pane";
import { AllResourceLabels } from "./AllResourceLabels";
import { memo } from "react";

export const Resources = memo(() => {
  return (
    <Pane
      id="resources"
      title="ASTEROID RESOURCES"
      defaultCoord={{ x: 25.5, y: 16.5 }}
      scene={Scenes.Asteroid}
      minOpacity={0.75}
      draggable
      persist
      pinnable
    >
      <AllResourceLabels />
    </Pane>
  );
});
