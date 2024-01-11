import { Scene } from "engine/types";
import { clone, throttle } from "lodash";
import { useEffect, useState } from "react";
import { useSettingsStore } from "../stores/SettingsStore";

export function createHooksApi(targetScene: Scene) {
  function useKeybinds() {
    return useSettingsStore((state) => state.keybinds);
  }

  function useCamera() {
    const [worldView, setWorldView] = useState<Phaser.Geom.Rectangle>();
    const [zoom, setZoom] = useState(0);
    const { camera } = targetScene;

    useEffect(() => {
      const worldViewListener = camera?.worldView$.subscribe(
        throttle((worldView: Phaser.Geom.Rectangle) => {
          setWorldView(clone(worldView));
        }, 50)
      );

      const zoomListener = camera?.zoom$.subscribe(throttle(setZoom, 100));

      return () => {
        worldViewListener?.unsubscribe();
        zoomListener?.unsubscribe();
      };
    }, [camera]);

    return {
      zoom,
      worldView,
    };
  }

  return {
    useKeybinds,
    useCamera,
  };
}
