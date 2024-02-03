import { Scenes } from "@game/constants";
import { Coord } from "@latticexyz/utils";
import React, { useState, useEffect, ReactNode, FC, useMemo } from "react";
import ReactDOM from "react-dom";
import { FaArrowsAlt, FaMinus, FaPlus } from "react-icons/fa";
import { RiPushpinFill, RiUnpinFill } from "react-icons/ri";
import { usePrimodium } from "src/hooks/usePrimodium";

let pinnedDepth = 0;
let unpinnedDepth = 10000;

export const Pane: FC<{
  id: string;
  title?: string;
  coord: Coord;
  children: ReactNode;
  draggable?: boolean;
  scene: Scenes;
  minOpacity?: number;
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
}> = ({ title, scene, id, coord, children, draggable = false, minOpacity = 0.5, origin = "top-left" }) => {
  const primodium = usePrimodium();
  const [container, setContainer] = useState<Phaser.GameObjects.DOMElement>();
  const [pinned, setPinned] = useState(true);
  const [containerRef, setContainerRef] = useState<HTMLDivElement>();
  const [minimized, setMinimized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Coord>({ x: 0, y: 0 });

  const [camera, uiCamera] = useMemo(() => {
    const { camera } = primodium.api(scene);
    const { camera: uiCamera } = primodium.api(Scenes.UI);

    return [camera, uiCamera];
  }, [primodium, scene]);

  const createContainer = (_camera: typeof camera, _coord: Coord, raw: boolean) => {
    if (container) container.destroy();

    const { container: _container, obj } = _camera.createDOMContainer(id, _coord, raw);
    obj.pointerEvents = "none";
    obj.setAlpha(minOpacity);
    setContainer(obj);
    setContainerRef(_container);
  };

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
    createContainer(camera, coord, scene === Scenes.UI ? true : false);

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

    return () => sub.unsubscribe();
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

          console.log(dragOffset);

          container?.setPosition(newPixelPosition.x - dragOffset.x, newPixelPosition.y - dragOffset.y);
        });
      }
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, draggable, dragOffset, container, pinned, camera, uiCamera]);

  if (!containerRef || !container) return null;

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
          {!pinned && (
            <RiPushpinFill
              className=""
              onClick={() => {
                setPinned(true);
                const worldCoord = camera.screenCoordToWorldCoord({ x: container.x, y: container.y });
                createContainer(camera, worldCoord, true);
                container.setDepth(pinnedDepth);
                container.setAlpha(1);
                container.setScale(1 / 8);
              }}
            />
          )}
          {pinned && (
            <RiUnpinFill
              className=""
              onClick={() => {
                setPinned(false);
                const screenCoord = camera.worldCoordToScreenCoord({ x: container.x, y: container.y });
                createContainer(uiCamera, screenCoord, true);
                container.setDepth(unpinnedDepth);
                container.setAlpha(1);
              }}
            />
          )}
          {draggable && <FaArrowsAlt className="" />}
          {!minimized && <FaMinus className="cursor-row-resize" onClick={() => setMinimized(true)} />}
          {minimized && <FaPlus className="cursor-row-resize" onClick={() => setMinimized(false)} />}
        </div>
      </div>
      <div className={`${minimized ? "max-h-0 overflow-hidden" : ""}`}>{children}</div>
    </div>,
    containerRef
  );
};
