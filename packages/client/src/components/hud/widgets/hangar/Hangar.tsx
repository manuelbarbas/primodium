import { memo } from "react";
import { Widget } from "src/components/core/Widget";
import { useMud } from "src/hooks";
import { getRandomRange } from "src/util/common";
import { HangarContent } from "./HangarContent";

export const Hangar = memo(() => {
  const { components } = useMud();
  const mapOpen = components.MapOpen.use()?.value;

  return (
    <div className="w-72">
      <Widget
        id="hangar"
        title="UNITS"
        icon="/img/unit/aegisdrone.png"
        defaultCoord={{
          x: window.innerWidth / 2 + getRandomRange(-50, 50),
          y: window.innerHeight / 2 + getRandomRange(-50, 50),
        }}
        defaultLocked
        defaultVisible
        origin="center"
        scene={"ASTEROID"}
        active={!mapOpen}
        hotkey={"Units"}
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
