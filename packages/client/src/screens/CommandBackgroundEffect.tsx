import { useOrbitingFleets } from "@/hooks/useOrbitingFleets";
import { components } from "@/network/components";
import { Mode } from "@/util/constants";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { memo } from "react";

export const CommandBackgroundEffect = memo(() => {
  const isCommandOpen = components.SelectedMode.use()?.value === Mode.CommandCenter;
  const selectedRock = components.SelectedRock.use()?.value;
  const position = components.Position.use(selectedRock);
  const fleets = useOrbitingFleets(selectedRock ?? singletonEntity);

  if (!isCommandOpen) return null;

  return (
    <>
      <div
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          transform: "rotateX(55deg) rotateY(0deg) rotatez(45deg) scale(2)",
        }}
        className="absolute top-0 left-0 w-full h-full heropattern-graphpaper-gray-500/10 rotate-45 scale-[200%] pointer-events-none animate-in fade-in"
      />
      <p
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          transform: "rotateX(55deg) rotateY(0deg) rotatez(-45deg)",
        }}
        className="absolute top-[20%] left-[10%] bg-transparent -z-[0] opacity-50 text-2xl flex gap-2 items-center"
      >
        COORDINATES: [{position?.x ?? 0}, {position?.y ?? 0}]
      </p>
      <p
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          transform: "rotateX(55deg) rotateY(0deg) rotatez(45deg)",
        }}
        className="absolute top-[20%] right-[16%] bg-transparent -z-[0] opacity-50 text-2xl flex gap-2 items-center"
      >
        {fleets.length} ORBITING FLEET(S)
      </p>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent text-l pointer-events-none" />
    </>
  );
});
