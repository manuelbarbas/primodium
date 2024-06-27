import { Badge } from "@/components/core/Badge";
import { Button } from "@/components/core/Button";
import { GlassCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { cn } from "@/util/client";

import { Entity } from "@primodiumxyz/reactive-tables";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useCallback } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useCore } from "@primodiumxyz/core/react";
import { Mode } from "@primodiumxyz/core";

export const ModeButton = (props: { mode: Entity; image: string }) => {
  const { tables } = useCore();
  const currentMode = tables.SelectedMode.use()?.value;

  return (
    <Button
      size="md"
      shape="square"
      variant="ghost"
      className={cn(currentMode === props.mode && "scale-125 pixel-border p-3", "hover:bg-transparent")}
      onClick={() => {
        tables.SelectedMode.set({
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
    type: Mode.Asteroid,
    name: "Asteroid",
    image: InterfaceIcons.Build,
  },
  {
    type: Mode.CommandCenter,
    name: "Command Center",
    image: InterfaceIcons.Command,
  },
  {
    type: Mode.Starmap,
    name: "Starbelt",
    image: InterfaceIcons.Starmap,
  },
];

export const ModeSelector = () => {
  const { tables } = useCore();
  const currentMode = tables.SelectedMode.use()?.value;
  const spectating = currentMode === Mode.Spectate;

  const handlePrev = useCallback(() => {
    const currentIndex = selectableModes.findIndex((mode) => mode.type === currentMode);
    const nextIndex = (currentIndex - 1 + selectableModes.length) % selectableModes.length;

    tables.SelectedMode.set({
      value: selectableModes[nextIndex].type,
    });
  }, [currentMode, tables.SelectedMode]);

  const handleNext = useCallback(() => {
    const currentIndex = selectableModes.findIndex((mode) => mode.type === currentMode);
    const nextIndex = (currentIndex + 1) % selectableModes.length;

    tables.SelectedMode.set({
      value: selectableModes[nextIndex].type,
    });
  }, [currentMode, tables.SelectedMode]);

  return (
    <div className="flex flex-col items-center pointer-events-auto">
      <div className="flex items-center relative">
        {!spectating && (
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
        )}
        <GlassCard direction="bottom" className="flex-row items-center gap-6 px-10">
          {selectableModes.map((mode) => (
            <ModeButton key={mode.type} mode={mode.type} image={mode.image} />
          ))}
          {spectating && (
            <div className="absolute inset-0 bg-neutral/75 backdrop-blur-md rounded-b-xl w-full h-full flex items-center justify-center pointer-events-auto">
              <Button
                variant={"ghost"}
                size="sm"
                className=" drop-shadow-hard hover:bg-transparent"
                onClick={() => {
                  tables.SelectedMode.set({
                    value: Mode.CommandCenter,
                  });

                  const buildRock = tables.BuildRock.get()?.value;
                  if (buildRock) {
                    tables.ActiveRock.set({
                      value: buildRock,
                    });
                  } else tables.ActiveRock.remove();
                }}
              >
                <IconLabel imageUri={InterfaceIcons.Return} className="text-2xl" />
              </Button>
            </div>
          )}
        </GlassCard>
        {!spectating && (
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
        )}
      </div>
      {currentMode && (
        <Badge variant="neutral" size="md" className="border-accent drop-shadow-hard border-t-0">
          {spectating ? "STOP SPECTATING" : selectableModes.find((mode) => mode.type === currentMode)?.name}
        </Badge>
      )}
    </div>
  );
};
