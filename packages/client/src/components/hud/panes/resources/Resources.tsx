import { Widget } from "src/components/core/Widget";
import { useMud } from "src/hooks";
import { getRandomRange } from "src/util/common";
import { AllResourceLabels } from "./AllResourceLabels";
import { AllUtilityLabels } from "./AllUtilityLabels";
import { KeybindActions } from "src/game/lib/constants/keybinds";

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
      hotkey={KeybindActions.Resources}
      active={!mapOpen}
      minOpacity={0.5}
      draggable
      lockable
      pinnable
      persist
    >
      <AllResourceLabels />
      <AllUtilityLabels />
    </Widget>
  );
};
