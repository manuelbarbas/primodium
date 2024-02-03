import { Scenes } from "@game/constants";
import { Pane } from "src/components/core/Pane";

import { AllBlueprints } from "./AllBlueprints";

export const Blueprints = () => {
  return (
    <Pane
      id="blueprints"
      title="BLUEPRINTS"
      coord={{ x: 11.5, y: 16.5 }}
      scene={Scenes.Asteroid}
      minOpacity={0.75}
      draggable
      origin="top-right"
    >
      <AllBlueprints />
    </Pane>
  );
};
