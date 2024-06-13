import { memo } from "react";
import { useCore, useOrbitingFleets } from "@primodiumxyz/core/react";
import { Mode } from "@primodiumxyz/core";
import { defaultEntity } from "@primodiumxyz/reactive-tables";

export const CommandBackgroundEffect = memo(() => {
  const { tables } = useCore();
  const isCommandOpen = tables.SelectedMode.use()?.value === Mode.CommandCenter;
  const selectedRock = tables.SelectedRock.use()?.value;
  const position = tables.Position.use(selectedRock);
  const fleets = useOrbitingFleets(selectedRock ?? defaultEntity);

  if (!isCommandOpen) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black">
      <div className="absolute top-0 left-0 w-full h-full command-background opacity-40" />
      <div
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          transform: "rotateX(55deg) rotateY(0deg) rotatez(45deg) scale(1)",
        }}
        className="absolute -top-full -left-full origin-center w-[400%] h-[400%] heropattern-graphpaper-gray-500/25 rotate-45 scale-[200%] pointer-events-none animate-in fade-in"
      />
      <p
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          transform: "rotateX(55deg) rotateY(0deg) rotatez(-45deg)",
        }}
        className="absolute top-[20%] left-[10%] bg-transparent opacity-50 text-2xl flex gap-2 items-center"
      >
        COORDINATES: [{position?.x ?? 0}, {position?.y ?? 0}]
      </p>

      <p
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          transform: "rotateX(55deg) rotateY(0deg) rotatez(45deg)",
        }}
        className="absolute top-[20%] right-[16%] bg-transparent opacity-50 text-2xl flex gap-2 items-center"
      >
        {fleets.length} ORBITING FLEET(S)
      </p>
      <div
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          transform: "rotateX(55deg) rotateY(0deg) rotatez(45deg) translate(-50%, 0%)",
        }}
        className="absolute top-1/2 left-1/2 text-2xl flex gap-2 items-center rounded-full w-44 h-44 bg-secondary/25 blur-3xl"
      />

      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
    </div>
  );
});
