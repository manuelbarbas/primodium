import { Scenes } from "@game/constants";
import { Widget } from "src/components/core/Widget";
import { AllResourceLabels } from "./AllResourceLabels";
import { useMud } from "src/hooks";
import { getRandomRange } from "src/util/common";

export const Resources = () => {
  const { components } = useMud();
  const mapOpen = components.MapOpen.use()?.value;

  return (
    <Widget
      id="resources"
      title="RESOURCES"
      icon="/img/resource/iron_resource.png"
      defaultCoord={{
        x: window.innerWidth / 2 + getRandomRange(-50, 50),
        y: window.innerHeight / 2 + getRandomRange(-50, 50),
      }}
      scene={Scenes.Asteroid}
      active={!mapOpen}
      minOpacity={0.5}
      draggable
      pinnable
      persist
    >
      <AllResourceLabels />
    </Widget>
  );
};
