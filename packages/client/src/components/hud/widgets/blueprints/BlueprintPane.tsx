import React, { useEffect, useRef, useState } from "react";
import { BuildingBlueprints } from "./BuildingBlueprints";
import { Button } from "src/components/core/Button";
import { usePrimodium } from "src/hooks/usePrimodium";
import { KeybindActions } from "src/game/lib/constants/keybinds";
import { useShallow } from "zustand/react/shallow";
import { usePersistentStore } from "src/game/stores/PersistentStore";

export const BlueprintPane = () => {
  const [visibleDiv, setVisibleDiv] = useState(0);
  const [arePanesExpanded, setArePanesExpanded] = useState(false);
  const primodium = usePrimodium();
  const {
    hooks: { useKeybinds },
    input: { addListener },
  } = useRef(primodium.api("ASTEROID")).current;
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
    const cycle = addListener(KeybindActions.Cycle, () => {
      setVisibleDiv((prev) => (prev + 1) % 4);
    });

    return () => {
      cycle.dispose();
    };
  }, [addListener]);

  const labels = ["Production", "Military", "Storage", "Infrastructure"];

  const imagePaths = [
    "/img/icons/blueprints/production.png",
    "/img/icons/blueprints/military.png",
    "/img/icons/blueprints/storage.png",
    "/img/icons/blueprints/infra.png",
  ];

  return (
    <div className="flex gap-0">
      <div>
        {/* Pane */}
        <div className={`grid ${arePanesExpanded ? "grid-cols-2 xl:grid-cols-4" : "grid-cols-1"}`}>
          {labels.map(
            (label, index) =>
              // Show only the selected div or all when expanded
              (arePanesExpanded || visibleDiv === index) && (
                <div key={index} className={`flex bg-neutral border border-secondary gap-1`}>
                  <BuildingBlueprints
                    buildingTypeToShow={index}
                    active={visibleDiv === index}
                    showHighlight={arePanesExpanded && !hideHotkeys}
                  />

                  {/* Show title when expanded */}
                  {arePanesExpanded && (
                    <span
                      className={`text-sm pt-2 text-vert px-1 border-l border-secondary/50 ${
                        label === "Production"
                          ? "text-yellow-500"
                          : label === "Military"
                          ? "text-lime-600"
                          : label === "Storage"
                          ? "text-violet-400"
                          : label === "Infrastructure"
                          ? "text-sky-500"
                          : ""
                      }`}
                      style={{ writingMode: "vertical-lr" }}
                    >
                      {label}
                    </span>
                  )}
                </div>
              )
          )}
        </div>

        {/* Toggle Expand/Collapse button ${arePanesExpanded ? 'mr-0' : 'mr-11'} */}
        <div className={`flex justify-end`}>
          <Button onClick={togglePanes} className="text-[.7rem] px-1 min-h-4 bg-transparent border-none">
            {arePanesExpanded ? "- Collapse" : "+ Expand"}
          </Button>
        </div>
      </div>

      {/* Menu Buttons (hidden when expanded) */}
      {!arePanesExpanded && (
        <div className="flex flex-col">
          {labels.map((label, index) => (
            <Button
              key={index}
              onClick={() => showDiv(index)}
              className={`text-s flex items-center bg-neutral/100 border border-secondary py-2 px-4 ${
                index === 3 ? "rounded-br-lg" : ""
              }`}
              style={{ writingMode: "vertical-lr" }}
            >
              <img src={imagePaths[index]} alt={label} className="w-4 h-4" />
              {/* Show title when active */}
              {visibleDiv === index && (
                <span
                  className={` ${
                    label === "Production"
                      ? "text-yellow-500"
                      : label === "Military"
                      ? "text-lime-600"
                      : label === "Storage"
                      ? "text-violet-400"
                      : label === "Infrastructure"
                      ? "text-sky-500"
                      : ""
                  }`}
                >
                  {label}
                </span>
              )}
            </Button>
          ))}
          {!hideHotkeys && (
            <p className="flex text-xs kbd kbd-xs py-2 w-fit" style={{ writingMode: "vertical-lr" }}>
              {keybinds[KeybindActions.Cycle]?.entries().next().value[0] ?? "?"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
