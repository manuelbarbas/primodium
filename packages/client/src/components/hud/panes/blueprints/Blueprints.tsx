import { Scenes } from "@game/constants";
import { memo } from "react";
import { Widget } from "src/components/core/Widget";
import { useMud } from "src/hooks";
import { AllBlueprints } from "./AllBlueprints";

export const Blueprints = memo(() => {
  const { components } = useMud();
  const mapOpen = components.MapOpen.use()?.value;
  const isBuilding = components.ActiveRock.use()?.value === components.BuildRock.use()?.value;

  return (
    <Widget
      id="blueprints"
      title="blueprints"
      icon="/img/icons/blueprinticon.png"
      defaultCoord={{ x: 69, y: 420 }}
      defaultLocked
      lockable
      defaultVisible
      origin="center-left"
      scene={Scenes.Asteroid}
      active={!mapOpen && isBuilding}
      minOpacity={0.6}
      draggable
      pinnable
      persist
    >
      <AllBlueprints />
    </Widget>
  );
});
