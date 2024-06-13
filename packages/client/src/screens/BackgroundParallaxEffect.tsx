import { ModeToSceneKey } from "@/game/lib/mappings";
import { useGame } from "@/hooks/useGame";
import { useCore } from "@primodiumxyz/core/react";
import { lerp, Mode } from "@primodiumxyz/core";
import { memo, useEffect, useRef } from "react";

export const BackgroundParallaxEffect = memo(() => {
  const { tables } = useCore();
  const selectedMode = tables.SelectedMode.use()?.value;
  const game = useGame();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sceneKey = ModeToSceneKey[selectedMode ?? Mode.Starmap];

    const worldViewSub = game[sceneKey].camera.worldView$.subscribe((worldView) => {
      if (ref.current) {
        ref.current.style.backgroundPosition = `${-worldView.x * 0.01}px ${-worldView.y * 0.01}px`;
      }
    });

    const zoomViewSub = game[sceneKey].camera.zoom$.subscribe((zoom) => {
      if (ref.current) {
        ref.current.style.transform = `scale(${lerp(
          zoom,
          game[sceneKey].config.camera.minZoom,
          game[sceneKey].config.camera.maxZoom,
          1,
          1.25
        )})`;
      }
    });

    return () => {
      worldViewSub?.unsubscribe();
      zoomViewSub?.unsubscribe();
    };
  }, [selectedMode, game]);

  return (
    <>
      <div ref={ref} className="absolute top-0 left-0 w-full h-full bg-black" />
      <div ref={ref} className="absolute top-0 left-0 w-full h-full star-background opacity-40" />
    </>
  );
});
