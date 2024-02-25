import { Scenes } from "@game/constants";
import { memo } from "react";
import { Widget } from "src/components/core/Widget";
import { useMud } from "src/hooks";
import { HangarContent } from "./HangarContent";
import { getRandomRange } from "src/util/common";

export const Hangar = memo(() => {
  const { components } = useMud();
  const mapOpen = components.MapOpen.use()?.value;

  return (
    <div className="w-72">
      <Widget
        id="hangar"
        title="UNITS"
        icon="/img/icons/attackicon.png"
        defaultCoord={{
          x: window.innerWidth / 2 + getRandomRange(-50, 50),
          y: window.innerHeight / 2 + getRandomRange(-50, 50),
        }}
        defaultLocked
        defaultVisible
        origin="center"
        scene={Scenes.Asteroid}
        active={!mapOpen}
        minOpacity={0.6}
        draggable
        pinnable
        persist
        lockable
      >
        <HangarContent />
      </Widget>
    </div>
  );
});
