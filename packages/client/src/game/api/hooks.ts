import { engine } from "@engine/api";
import { Scenes } from "@game/constants";
import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { EntityID, getComponentValue } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { throttle } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useMud } from "src/context/MudContext";
import { useAccount } from "src/hooks/useAccount";
import { useComponentValue } from "src/hooks/useComponentValue";
import { offChainComponents, singletonIndex, world } from "src/network/world";
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
  return useComponentValue(offChainComponents.SelectedTile, singletonIndex);
};

export const useSelectedBuilding = () => {
  const buildingEntity = useComponentValue(
    offChainComponents.SelectedBuilding,
    singletonIndex
  )?.value;
  if (!buildingEntity) return;
  return world.entityToIndex.get(buildingEntity);
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

export const useMainBase = () => {
  const { world, singletonIndex, components } = useMud();
  const { address } = useAccount();

  // if provide an entityId, use as owner
  // else try to use wallet, otherwise use default index
  const resourceKey = address
    ? world.entityToIndex.get(address.toString().toLowerCase() as EntityID)!
    : singletonIndex;

  // fetch the main base of the user based on address
  const mainBase = useComponentValue(
    components.MainBaseInitialized,
    resourceKey
  )?.value;

  if (!mainBase) return;
  const mainBaseEntity = world.entityToIndex.get(mainBase);
  if (!mainBaseEntity) return;
  return getComponentValue(components.Position, mainBaseEntity);
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
