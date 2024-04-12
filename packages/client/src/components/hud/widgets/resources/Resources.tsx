import { Widget } from "@/components/core/Widget";
import { useMud } from "@/hooks";
import { getRandomRange } from "@/util/common";
import { AllResourceLabels } from "@/components/hud/widgets/resources/AllResourceLabels";
import { AllUtilityLabels } from "@/components/hud/widgets/resources/AllUtilityLabels";

export const Resources = () => {
  const { components } = useMud();
  const mapOpen = components.MapOpen.use()?.value;

  return (
    <Widget
      id="resources"
      title="RESOURCES"
      icon="/img/resource/iridium_resource.png"
      defaultCoord={{
        x: window.innerWidth / 2 + getRandomRange(-50, 50),
        y: window.innerHeight / 2 + getRandomRange(-50, 50),
      }}
      defaultVisible
      defaultLocked
      scene={"ASTEROID"}
      hotkey={"Resources"}
      active={!mapOpen}
      minOpacity={0.5}
      draggable
      lockable
      pinnable
      persist
      noBorder
    >
      <AllResourceLabels />
      <AllUtilityLabels />
    </Widget>
  );
};
