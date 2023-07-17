import { SingletonID } from "@latticexyz/network";
import { Network } from "../../network/layer";
import { useComponentValue } from "src/hooks/useComponentValue";
import { Coord } from "@latticexyz/utils";
import { useSettingsStore } from "../stores/SettingsStore";
import { Scenes } from "@game/constants";
import { engine } from "@engine/api";
import { useEffect, useRef, useState } from "react";
import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { throttle } from "lodash";
import { useAccount } from "src/hooks/useAccount";
import { useMud } from "src/context/MudContext";
import { EntityID } from "@latticexyz/recs";

export const useGameReady = (network: Network) => {
  const { offChainComponents, singletonIndex } = network;

  return useComponentValue(offChainComponents.GameReady, singletonIndex, {
    value: false,
  }).value;
};

export const useBlockNumber = (network: Network) => {
  const { offChainComponents, singletonIndex } = network;

  return useComponentValue(offChainComponents.BlockNumber, singletonIndex, {
    value: 0,
  }).value;
};

export const useSelectedTile = (network: Network) => {
  const { offChainComponents, world } = network;

  const singletonIndex = world.entityToIndex.get(SingletonID);

  return useComponentValue(offChainComponents.SelectedTile, singletonIndex);
};

export const useHoverTile = (network: Network) => {
  const { offChainComponents, world } = network;

  const singletonIndex = world.entityToIndex.get(SingletonID);

  return useComponentValue(offChainComponents.SelectedTile, singletonIndex);
};

export const useSelectedBuilding = (network: Network) => {
  const { offChainComponents, world } = network;

  const singletonIndex = world.entityToIndex.get(SingletonID);

  return useComponentValue(offChainComponents.SelectedBuilding, singletonIndex)
    ?.value;
};

export const useStartSelectedPath = (network: Network) => {
  const { offChainComponents, world } = network;

  const singletonIndex = world.entityToIndex.get(SingletonID);

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
  const mainBaseCoord = useComponentValue(
    components.MainBaseInitialized,
    resourceKey
  );

  return mainBaseCoord;
};

export const useKeybinds = () => {
  const keybinds = useSettingsStore((state) => state.keybinds);

  return keybinds;
};

export const useCamera = (network: Network, targetScene = Scenes.Main) => {
  const [worldCoord, setWorldCoord] = useState<Coord>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0);
  const gameStatus = useGameReady(network);
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
