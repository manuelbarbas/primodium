import engine from "engine";
import { Scenes } from "@game/constants";
import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { Coord } from "@latticexyz/utils";
import { throttle } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useComponentValue } from "src/hooks/useComponentValue";
import { offChainComponents, singletonIndex } from "src/network/world";
import { Network } from "../../network/layer";
import { useSettingsStore } from "../stores/SettingsStore";

export const useGameReady = () => {
  return useComponentValue(offChainComponents.GameReady, singletonIndex, {
    value: false,
  }).value;
};

export const useBlockNumber = () => {
  return useComponentValue(offChainComponents.BlockNumber, singletonIndex, {
    value: 0,
  }).value;
};

export const useSelectedTile = () => {
  return useComponentValue(offChainComponents.SelectedTile, singletonIndex);
};

export const useHoverTile = () => {
  return useComponentValue(offChainComponents.HoverTile, singletonIndex);
};

export const useSelectedBuilding = () => {
  const selectedBuilding = useComponentValue(
    offChainComponents.SelectedBuilding,
    singletonIndex
  )?.value;

  return selectedBuilding;
};

export const useStartSelectedPath = () => {
  return useComponentValue(
    offChainComponents.StartSelectedPath,
    singletonIndex
  );
};

export const useSelectedAttack = (network: Network) => {
  const { offChainComponents, singletonIndex } = network;

  const selectedAttack = useComponentValue(
    offChainComponents.SelectedAttack,
    singletonIndex,
    {
      origin: undefined,
      target: undefined,
    }
  );

  return {
    origin: (JSON.parse(selectedAttack?.origin ?? "null") ?? undefined) as
      | Coord
      | undefined,
    target: (JSON.parse(selectedAttack?.target ?? "null") ?? undefined) as
      | Coord
      | undefined,
  };
};

export const useSelectedAction = () => {
  return useComponentValue(offChainComponents.SelectedAction, singletonIndex);
};

export const useKeybinds = () => {
  const keybinds = useSettingsStore((state) => state.keybinds);

  return keybinds;
};

export const useCamera = (_: Network, targetScene = Scenes.Main) => {
  const [worldCoord, setWorldCoord] = useState<Coord>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0);
  const gameStatus = useGameReady();
  const minZoom = useRef(1);

  useEffect(() => {
    if (!gameStatus) {
      return;
    }

    const {
      camera,
      tilemap: { tileHeight, tileWidth },
      config: { camera: cameraconfig },
    } = engine.getGame()?.sceneManager.scenes.get(targetScene)!;

    minZoom.current = cameraconfig.minZoom;

    const worldViewListener = camera?.worldView$.subscribe(
      throttle((worldView) => {
        const tileCoord = pixelCoordToTileCoord(
          { x: worldView.centerX, y: worldView.centerY },
          tileWidth,
          tileHeight
        );

        setWorldCoord({ x: tileCoord.x, y: -tileCoord.y });
      }, 100)
    );

    const zoomListener = camera?.zoom$.subscribe(throttle(setZoom, 100));

    return () => {
      worldViewListener?.unsubscribe();
      zoomListener?.unsubscribe();
    };
  }, [gameStatus]);

  const normalizedZoom = zoom / minZoom.current;

  return { worldCoord, zoom, normalizedZoom };
};
