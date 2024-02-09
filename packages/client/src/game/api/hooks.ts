import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { clone, throttle } from "lodash";
import { useEffect, useState } from "react";
import { getDegreeDirection } from "src/util/common";
import { usePersistentStore } from "../stores/PersistentStore";

export function createHooksApi(targetScene: Scene) {
  function useKeybinds() {
    return usePersistentStore((state) => state.keybinds);
  }

  function useCamera() {
    const [worldView, setWorldView] = useState<Phaser.Geom.Rectangle>();
    const [zoom, setZoom] = useState(targetScene.camera.phaserCamera.zoom);
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

  function useCoordToScreenCoord(coord: Coord, bounded = false) {
    const {
      tilemap: { tileHeight, tileWidth },
      camera: { phaserCamera, worldView$ },
    } = targetScene;

    const [state, setState] = useState({
      screenCoord: { x: 0, y: 0 },
      isBounded: false,
      direction: 0,
    });

    useEffect(() => {
      const callback = (worldView: Phaser.Geom.Rectangle) => {
        const pixelCoord = tileCoordToPixelCoord(coord, tileWidth, tileHeight);
        const zoom = phaserCamera.zoom;
        pixelCoord.y = -pixelCoord.y; // Adjust for coordinate system. Y is inverted in Phaser

        let isBoundedTemp = false;

        if (bounded) {
          if (pixelCoord.x < worldView.x) {
            pixelCoord.x = worldView.x;
            isBoundedTemp = true;
          } else if (pixelCoord.x > worldView.right) {
            pixelCoord.x = worldView.right;
            isBoundedTemp = true;
          }

          if (pixelCoord.y < worldView.y) {
            pixelCoord.y = worldView.y;
            isBoundedTemp = true;
          } else if (pixelCoord.y > worldView.bottom) {
            pixelCoord.y = worldView.bottom;
            isBoundedTemp = true;
          }
        }

        const newScreenCoord = {
          x: (pixelCoord.x - worldView.x) * zoom,
          y: (pixelCoord.y - worldView.y) * zoom,
        };
        const newDirection = getDegreeDirection({ x: worldView.centerX, y: worldView.centerY }, pixelCoord);

        setState({
          screenCoord: newScreenCoord,
          isBounded: isBoundedTemp,
          direction: newDirection,
        });
      };
      callback(phaserCamera.worldView);
      const worldViewListener = worldView$.subscribe(callback);
      return () => worldViewListener.unsubscribe();
    }, [coord, bounded, phaserCamera, tileHeight, tileWidth, worldView$]);

    return state;
  }

  return {
    useKeybinds,
    useCamera,
    useCoordToScreenCoord,
  };
}
