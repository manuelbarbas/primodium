import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { AllResourceLabels } from "@/components/hud/asteroid/inventory/resources/AllResourceLabels";
import { AllUtilityLabels } from "@/components/hud/asteroid/inventory/resources/AllUtilityLabels";
import { usePersistentStore } from "@primodiumxyz/game/src/stores/PersistentStore";
import { useGame } from "@/hooks/useGame";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Hangar } from "@/components/hud/asteroid/inventory/hangar/Hangar";
import { EntityToResourceImage, EntityToUnitImage } from "@/util/image";
import { EntityType } from "@primodiumxyz/core";

export const InventoryPane = () => {
  const [visibleDiv, setVisibleDiv] = useState(0);
  const [arePanesExpanded, setArePanesExpanded] = useState(false);
  const game = useGame();

  const {
    hooks: { useKeybinds },
    input: { addListener },
  } = useRef(game.ASTEROID).current;
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
    const cycle = addListener("Base", () => {
      setVisibleDiv((prev) => (prev + 1) % 2);
    });

    return () => {
      cycle.dispose();
    };
  }, [addListener]);

  const labels = ["Resources", "Units"];

  const imagePaths = [EntityToResourceImage[EntityType.Iridium], EntityToUnitImage[EntityType.AegisDrone]];

  const Content = ({ index }: { index: number }) => {
    const className = "h-[26rem] !w-72";
    if (index === 0)
      return (
        <Card noDecor className={className}>
          <AllResourceLabels />
          <AllUtilityLabels />
        </Card>
      );

    if (index === 1) return <Hangar className={className} />;
  };

  return (
    <div className="flex gap-0">
      {/* Menu Buttons (hidden when expanded) */}
      {!arePanesExpanded && (
        <div>
          {labels.map((label, index) => (
            <div className="flex" key={index}>
              <Button
                onClick={() => showDiv(index)}
                className={`ml-auto !flex !items-center !bg-neutral/100 !border !border-secondary !py-3 px-4 ${
                  index === 1 ? "rounded-bl-lg" : ""
                }`}
                style={{ writingMode: "vertical-rl" }}
              >
                <img src={imagePaths[index]} alt={label} className="w-4 h-4" />
                {/* Show title when active */}
                {visibleDiv === index && <span>{label}</span>}
              </Button>
            </div>
          ))}
          {!hideHotkeys && (
            <div className="flex">
              <p className="ml-auto text-xs kbd kbd-xs py-2 w-fit self-end" style={{ writingMode: "vertical-rl" }}>
                {keybinds["Base"]?.entries().next().value[0] ?? "?"}
              </p>
            </div>
          )}
        </div>
      )}
      <div>
        {/* Pane */}
        <div className={`grid ${arePanesExpanded ? "grid-cols-2" : "grid-cols-1"}`}>
          {labels.map(
            (_, index) =>
              // Show only the selected div or all when expanded
              (arePanesExpanded || visibleDiv === index) && (
                <div key={index} className={`flex bg-neutral border border-secondary gap-1`}>
                  <Content index={index} />
                </div>
              )
          )}
        </div>

        {/* Toggle Expand/Collapse button ${arePanesExpanded ? 'mr-0' : 'mr-11'} */}
        <div className={`flex justify-end`}>
          <Button onClick={togglePanes} variant={"ghost"} size={"xs"} className="text-[.7rem] px-2 m-1">
            {arePanesExpanded ? "- Collapse" : "+ Expand"}
          </Button>
        </div>
      </div>
    </div>
  );
};
