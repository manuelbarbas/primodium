import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { InterfaceIcons } from "@primodiumxyz/assets";
import { EntityType } from "@primodiumxyz/core";
import { usePersistentStore } from "@primodiumxyz/game/src/stores/PersistentStore";
import { Button } from "@/components/core/Button";
import { IconLabel } from "@/components/core/IconLabel";
import { OwnedAsteroids } from "@/components/hud/starbelt/starmap-navigator/OwnedAsteroids";
import { OwnedColonyShips } from "@/components/hud/starbelt/starmap-navigator/OwnedColonyShips";
import { OwnedFleets } from "@/components/hud/starbelt/starmap-navigator/OwnedFleets";
import { Shards } from "@/components/hud/starbelt/starmap-navigator/Shards";
import { useGame } from "@/hooks/useGame";
import { EntityToUnitImage } from "@/util/image";

export const StarmapNavigatorPane = () => {
  const [visibleDiv, setVisibleDiv] = useState(0);
  const [arePanesExpanded, setArePanesExpanded] = useState(false);
  const game = useGame();
  const {
    hooks: { useKeybinds },
    input: { addListener },
  } = useRef(game.STARMAP).current;
  const keybinds = useKeybinds();
  const [hideHotkeys] = usePersistentStore(useShallow((state) => [state.hideHotkeys]));

  // Shows a specific div
  const showDiv = (index: number) => {
    setVisibleDiv(index);
    setArePanesExpanded(false);
  };

  // Toggles the expand/collapse state
  const togglePanes = () => {
    setArePanesExpanded(!arePanesExpanded);
  };

  useEffect(() => {
    const cycle = addListener("Cycle", () => {
      setVisibleDiv((prev) => (prev + 1) % 4);
    });

    return () => {
      cycle.dispose();
    };
  }, [addListener]);

  const labels = ["Asteroids", "Fleets", "Colony Ships", "Volatile Shards"];

  const imagePaths = [
    InterfaceIcons.Asteroid,
    InterfaceIcons.Fleet,
    EntityToUnitImage[EntityType.ColonyShip],
    InterfaceIcons.Shard,
  ];

  const Content = ({ index }: { index: number }) => {
    const className = "h-96 w-96";
    if (index === 0) return <OwnedAsteroids className={className} />;
    if (index === 1) return <OwnedFleets className={className} />;
    if (index === 2) return <OwnedColonyShips className={className} />;
    if (index === 3) return <Shards className={className} />;
  };

  return (
    <div className="flex gap-0">
      {/* Menu Buttons (hidden when expanded) */}
      <div>
        {/* Pane */}
        <div className={`grid ${arePanesExpanded ? "grid-cols-2" : "grid-cols-1"}`}>
          {labels.map(
            (label, index) =>
              // Show only the selected div or all when expanded
              (arePanesExpanded || visibleDiv === index) && (
                <div key={index} className={`flex bg-neutral border border-secondary gap-1`}>
                  <Content index={index} />
                </div>
              ),
          )}
        </div>

        {/* Toggle Expand/Collapse button ${arePanesExpanded ? 'mr-0' : 'mr-11'} */}
        <div className={`flex justify-end`}>
          <Button onClick={togglePanes} variant={"ghost"} size={"xs"} className="text-[.7rem] px-2 m-1">
            {arePanesExpanded ? "- Collapse" : "+ Expand"}
          </Button>
        </div>
      </div>
      {!arePanesExpanded && (
        <div>
          {labels.map((label, index) => (
            <Button
              key={index}
              onClick={() => showDiv(index)}
              className={`flex !items-center !bg-neutral/100 !border !border-secondary py-4 w-12 ${
                index === 3 ? "rounded-br-lg" : ""
              } `}
              style={{ writingMode: "vertical-lr" }}
            >
              <IconLabel
                text={visibleDiv === index ? label : ""}
                imageUri={imagePaths[index]}
                className={`gap-2 ${
                  label === "Asteroids"
                    ? "text-yellow-500"
                    : label === "Fleets"
                      ? "text-lime-600"
                      : label === "Colony Ships"
                        ? "text-violet-400"
                        : label === "Volatile Shards"
                          ? "text-sky-500"
                          : ""
                }`}
                style={{
                  writingMode: "vertical-lr",
                }}
              />
            </Button>
          ))}
          {!hideHotkeys && (
            <p className="flex text-xs kbd kbd-xs py-2 w-fit" style={{ writingMode: "vertical-lr" }}>
              {keybinds["Cycle"]?.entries().next().value[0] ?? "?"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
