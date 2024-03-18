import { KeybindActions, Scenes } from "@game/constants";
import { memo } from "react";
import { Widget } from "src/components/core/Widget";
import { useMud } from "src/hooks";

import { BlueprintPane } from "./BlueprintPane";

export const Blueprints = memo(() => {
  const { components } = useMud();
  const mapOpen = components.MapOpen.use()?.value;
  const isBuilding = components.ActiveRock.use()?.value === components.BuildRock.use()?.value;

  return (
    <Widget
      id="blueprints"
      title="blueprints"
      icon="/img/icons/blueprinticon.png"
      defaultCoord={{ x: 20, y: 20 }}
      defaultLocked
      defaultPinned
      defaultVisible
      origin="center-left"
      scene={Scenes.Asteroid}
      active={!mapOpen && isBuilding}
      hotkey={KeybindActions.Blueprints}
      minOpacity={0.6}
      lockable
      draggable
      pinnable
      persist
      noBorder
    >
      <BlueprintPane />
    </Widget>
  );
});
