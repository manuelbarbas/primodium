import { Scenes } from "@game/constants";
import { Pane } from "src/components/core/Pane";
import { AllResourceLabels } from "./AllResourceLabels";

export const Resources = () => {
  return (
    <Pane
      id="resources"
      title="ASTEROID RESOURCES"
      coord={{ x: 25.5, y: 16.5 }}
      scene={Scenes.Asteroid}
      minOpacity={0.75}
      draggable
    >
      <AllResourceLabels />
    </Pane>
  );
};
