import { Scenes } from "@game/constants";
import { PinnedPane } from "src/components/core/PinnedPane";
import { AllResourceLabels } from "./AllResourceLabels";

export const Resources = () => {
  return (
    <PinnedPane
      id="resources"
      title="ASTEROID RESOURCES"
      coord={{ x: 25.5, y: 16.5 }}
      scene={Scenes.Asteroid}
      minOpacity={0.75}
      draggable
    >
      <AllResourceLabels />
    </PinnedPane>
  );
};
