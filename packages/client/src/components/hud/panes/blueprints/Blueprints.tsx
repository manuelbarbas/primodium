import { memo } from "react";
import { Scenes } from "@game/constants";
import { Pane } from "src/components/core/Pane";

import { AllBlueprints } from "./AllBlueprints";

export const Blueprints = memo(() => {
  return (
    <Pane
      id="blueprints"
      title="BLUEPRINTS"
      defaultCoord={{ x: 11.5, y: 16.5 }}
      scene={Scenes.Asteroid}
      minOpacity={0.75}
      draggable
      origin="top-right"
    >
      <AllBlueprints />
    </Pane>
  );
});
