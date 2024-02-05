import { Scenes } from "@game/constants";
import { Pane } from "src/components/core/Pane";
import { AllResourceLabels } from "./AllResourceLabels";
import { memo, useState } from "react";

export const Resources = memo(() => {
  const [visible, setVisible] = useState(true);
  return (
    <Pane
      id="resources"
      title="ASTEROID RESOURCES"
      defaultCoord={{ x: 25.5, y: 16.5 }}
      scene={Scenes.Asteroid}
      minOpacity={0.75}
      onClose={() => setVisible(false)}
      draggable
      persist
      pinnable
      visible={visible}
    >
      <AllResourceLabels />
    </Pane>
  );
});
