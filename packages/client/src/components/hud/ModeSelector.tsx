import { Badge } from "@/components/core/Badge";
import { Button } from "@/components/core/Button";
import { GlassCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { useMud } from "@/hooks";
import { cn } from "@/util/client";

import { Mode } from "@/util/constants";
import { Entity } from "@latticexyz/recs";
import { useCallback } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ModeToName = {
  [Mode.Building]: "Building",
  [Mode.Starmap]: "Starmap",
  [Mode.EmpireManager]: "Empire Manager",
};

export const ModeButton = (props: { mode: Entity; image: string }) => {
  const { components } = useMud();
  const currentMode = components.SelectedMode.use()?.value;

  return (
    <Button
      size="md"
      shape="square"
      variant="ghost"
      className={cn(currentMode === props.mode && "scale-125 pixel-border p-3", "hover:bg-transparent")}
      onClick={() => {
        components.SelectedMode.set({
          value: props.mode,
        });
      }}
    >
      {currentMode === props.mode && (
        <div className="absolute inset-0 bg-gradient-to-t from-accent/25 to-transparent" />
      )}
      <IconLabel imageUri={props.image} className={cn("text-2xl")} />
    </Button>
  );
};

const selectableModes = [
  {
    type: Mode.Building,
    name: "Building",
    image: "/img/icons/minersicon.png",
  },
  {
    type: Mode.Starmap,
    name: "Starmap",
    image: "/img/icons/starmapicon.png",
  },
  {
    type: Mode.EmpireManager,
    name: "Empire Manager",
    image: "/img/icons/outgoingicon.png",
  },
];

export const ModeSelector = () => {
  const { components } = useMud();
  const currentMode = components.SelectedMode.use()?.value;

  const handlePrev = useCallback(() => {
    const currentIndex = selectableModes.findIndex((mode) => mode.type === currentMode);
    const nextIndex = (currentIndex - 1 + selectableModes.length) % selectableModes.length;

    components.SelectedMode.set({
      value: selectableModes[nextIndex].type,
    });
  }, [currentMode, components.SelectedMode]);

  const handleNext = useCallback(() => {
    const currentIndex = selectableModes.findIndex((mode) => mode.type === currentMode);
    const nextIndex = (currentIndex + 1) % selectableModes.length;

    components.SelectedMode.set({
      value: selectableModes[nextIndex].type,
    });
  }, [currentMode, components.SelectedMode]);

  return (
    <div className="flex flex-col items-center pointer-events-auto">
      <div className="flex items-center relative">
        <Button
          shape="square"
          variant="neutral"
          size="sm"
          className="text-accent text-sm drop-shadow-hard border-r-0"
          onClick={handlePrev}
          keybind="PrevHotbar"
        >
          <FaChevronLeft />
        </Button>
        <GlassCard direction="bottom" className="flex-row items-center gap-4">
          {selectableModes.map((mode) => (
            <ModeButton key={mode.type} mode={mode.type} image={mode.image} />
          ))}
        </GlassCard>
        <Button
          shape="square"
          variant="neutral"
          size="sm"
          className="text-accent text-sm drop-shadow-hard border-l-0"
          onClick={handleNext}
          keybind="NextHotbar"
        >
          <FaChevronRight />
        </Button>
      </div>
      {currentMode && (
        <Badge variant="neutral" size="md" className="border-accent drop-shadow-hard border-t-0">
          {ModeToName[currentMode]}
        </Badge>
      )}
    </div>
  );
};
