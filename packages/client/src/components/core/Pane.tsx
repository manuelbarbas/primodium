import { Scenes } from "@game/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Coord } from "@latticexyz/utils";
import { useState, useEffect, ReactNode, FC, useMemo, useCallback } from "react";
import ReactDOM from "react-dom";
import { FaMinus, FaPlus, FaTimes } from "react-icons/fa";
import { RiPushpinFill, RiUnpinFill } from "react-icons/ri";
import { usePersistantStore } from "src/game/stores/PersistantStore";
import { usePrimodium } from "src/hooks/usePrimodium";

let pinnedDepth = 0;
let unpinnedDepth = 10000;

export const Pane: FC<{
  id: string;
  title?: string;
  defaultCoord: Coord;
  children: ReactNode;
  draggable?: boolean;
  scene: Scenes;
  minOpacity?: number;
  persist?: boolean;
  pinnable?: boolean;
  visible?: boolean;
  onClose?: () => void;
  origin?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center"
    | "center-left"
    | "center-right"
    | "center-top"
    | "center-bottom";
}> = ({
  title,
  scene,
  id,
  defaultCoord,
  children,
  draggable = false,
  minOpacity = 0.5,
  origin = "top-left",
  persist = false,
  pinnable = false,
  visible = true,
  onClose,
}) => {
  const primodium = usePrimodium();
  const [paneInfo, setPane, removePane] = usePersistantStore((state) => [state.panes, state.setPane, state.removePane]);
  const [container, setContainer] = useState<Phaser.GameObjects.DOMElement>();
  const [containerRef, setContainerRef] = useState<HTMLDivElement>();
  const [minimized, setMinimized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Coord>({ x: 0, y: 0 });
  const [pinned, setPinned] = useState(paneInfo[id]?.pinned ?? (scene === Scenes.UI ? false : true));

  const [camera, uiCamera, config] = useMemo(() => {
    const { camera } = primodium.api(scene);
    const {
      camera: uiCamera,
      scene: { getConfig },
    } = primodium.api(Scenes.UI);
    const config = getConfig(scene);

    return [camera, uiCamera, config];
  }, [primodium, scene]);

  const [coord, resetCoord] = useMemo(() => {
    const storedCoord = usePersistantStore.getState().panes[id]?.coord;
    const pixelCoord = tileCoordToPixelCoord(
      defaultCoord,
      config?.tilemap.tileWidth ?? 32,
      config?.tilemap.tileHeight ?? 32
    );
    const resetCoord = { x: pixelCoord.x, y: -pixelCoord.y };
    return [storedCoord ?? resetCoord, resetCoord];
  }, [defaultCoord, id, config]);

  const createContainer = useCallback(
    (_camera: typeof camera, _coord: Coord, raw: boolean) => {
      if (container) {
        container.destroy();
      }

      const { container: _container, obj } = _camera.createDOMContainer(id, _coord, raw);
      obj.pointerEvents = "none";
      obj.setAlpha(pinned ? minOpacity : 1);
      setContainer(obj);
      setContainerRef(_container);

      return obj;
    },
    [container, id, minOpacity, pinned]
  );

  const translate = useMemo(() => {
    switch (origin) {
      case "top-left":
        return "";
      case "top-right":
        return "-translate-x-full";
      case "bottom-left":
        return "-translate-y-full";
      case "bottom-right":
        return "-translate-x-full -translate-y-full";
      case "center":
        return "-translate-x-1/2 -translate-y-1/2";
      case "center-right":
        return "-translate-x-full -translate-y-1/2";
      case "center-left":
        return "-translate-y-1/2";
      case "center-top":
        return "-translate-x-1/2";
      case "center-bottom":
        return "-translate-x-1/2 -translate-y-full";
    }
  }, [origin]);

  useEffect(() => {
    createContainer(pinned ? camera : uiCamera, coord, true);

    return () => {
      if (container) container.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coord]);

  useEffect(() => {
    if (!container || !pinned) return;

    container.scale = 1 / camera.phaserCamera.zoom;

    const sub = camera.zoom$.subscribe((zoom) => {
      container.scale = 1 / zoom;
    });

    return () => {
      sub.unsubscribe();
    };
  }, [scene, container, pinned, camera]);

  useEffect(() => {
    if (!draggable) return;
    const handleMouseMove = (event: MouseEvent) => {
      if (dragging) {
        requestAnimationFrame(() => {
          const newPixelPosition = (!pinned ? uiCamera : camera).screenCoordToWorldCoord({
            x: event.clientX,
            y: event.clientY,
          });

          const newCoord = { x: newPixelPosition.x - dragOffset.x, y: newPixelPosition.y - dragOffset.y };

          container?.setPosition(newCoord.x, newCoord.y);
        });
      }
    };

    const handleMouseUp = () => {
      if (dragging) {
        if (!container) return;

        persist && setPane(id, container, pinned);
      }

      setDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, draggable, dragOffset, container, pinned, camera, uiCamera, config, id, setPane, persist]);

  useEffect(() => {
    const handleResize = () => {
      if (!container || pinned) return;

      if (!uiCamera.phaserCamera.worldView.contains(container.x, container.y)) {
        setPinned(true);
        const newContainer = createContainer(camera, resetCoord, true);
        removePane(id);
        newContainer.setDepth(pinnedDepth);
        newContainer.setAlpha(minOpacity);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [pinned, container, camera, resetCoord, id, removePane, createContainer, uiCamera, minOpacity]);

  if (!containerRef || !container || !visible) return null;

  return ReactDOM.createPortal(
    <div
      className={`relative min-w-44 transition-opacity duration-600 ${translate} pointer-events-auto font-pixel select-none ${
        !pinned ? "drop-shadow-hard" : ""
      }`}
      onPointerEnter={() => pinned && container.setAlpha(1)}
      onPointerLeave={() => pinned && !dragging && container.setAlpha(minOpacity)}
    >
      <div
        className={`flex absolute top-0 -translate-y-full right-0 p-1 border-secondary text-xs items-center gap-3 justify-between w-full cursor-move ${
          pinned ? "bg-neutral/75" : "bg-secondary"
        }`}
        onDoubleClick={() => {
          setPinned(true);
          const newContainer = createContainer(camera, resetCoord, true);
          removePane(id);
          newContainer.setDepth(pinnedDepth);
          newContainer.setAlpha(minOpacity);
        }}
        onMouseDown={(event) => {
          const originPixelCoord = (!pinned ? uiCamera : camera).screenCoordToWorldCoord({
            x: event.clientX,
            y: event.clientY,
          });

          setDragOffset({ x: originPixelCoord.x - container.x, y: originPixelCoord.y - container.y });
          if (pinned) {
            container.setDepth(pinnedDepth + 1);
            pinnedDepth++;
          } else {
            container.setDepth(unpinnedDepth + 1);
            unpinnedDepth++;
          }
          setDragging(true);
        }}
      >
        {title}
        <div className="flex items-center gap-1">
          {pinnable && scene !== Scenes.UI && (
            <>
              {!pinned && (
                <RiPushpinFill
                  className="cursor-crosshair"
                  onClick={() => {
                    setPinned(true);
                    const worldCoord = camera.screenCoordToWorldCoord({ x: container.x, y: container.y });
                    const newContainer = createContainer(camera, worldCoord, true);
                    newContainer.setDepth(pinnedDepth);
                    newContainer.setAlpha(1);
                    persist && setPane(id, worldCoord, true);
                  }}
                />
              )}
              {pinned && (
                <RiUnpinFill
                  className="cursor-crosshair"
                  onClick={() => {
                    setPinned(false);
                    const screenCoord = camera.worldCoordToScreenCoord({ x: container.x, y: container.y });
                    const newContainer = createContainer(uiCamera, screenCoord, true);
                    newContainer.setDepth(unpinnedDepth);
                    newContainer.setAlpha(1);
                    persist && setPane(id, screenCoord, false);
                  }}
                />
              )}
            </>
          )}

          {!minimized && <FaMinus className="cursor-n-resize" onClick={() => setMinimized(true)} />}
          {minimized && <FaPlus className="cursor-s-resize" onClick={() => setMinimized(false)} />}
          {onClose && <FaTimes className="cursor-pointer" onClick={onClose} />}
        </div>
      </div>
      <div className={`bg-base-200 min-w-72 border border-t-success border-secondary ${minimized ? "opacity-0" : ""}`}>
        {children}
      </div>
    </div>,
    containerRef
  );
};
