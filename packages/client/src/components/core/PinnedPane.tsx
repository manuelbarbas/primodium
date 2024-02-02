import { Scenes } from "@game/constants";
import { Coord } from "@latticexyz/utils";
import React, { useState, useEffect, ReactNode, FC, useMemo } from "react";
import ReactDOM from "react-dom";
import { FaArrowsAlt, FaMinus, FaPlus } from "react-icons/fa";
import { usePrimodium } from "src/hooks/usePrimodium";

export const PinnedPane: FC<{
  id: string;
  title?: string;
  coord: Coord;
  children: ReactNode;
  draggable?: boolean;
  scene: Scenes;
  minOpacity?: number;
  noScale?: boolean;
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
  coord,
  children,
  draggable = false,
  minOpacity = 0.5,
  origin = "top-left",
  noScale = false,
}) => {
  const primodium = usePrimodium();
  const [container, setContainer] = useState<Phaser.GameObjects.DOMElement>();
  const [containerRef, setContainerRef] = useState<HTMLDivElement>();
  const [minimized, setMinimized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Coord>({ x: 0, y: 0 });

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
    const {
      camera: { createDOMContainer, zoom$ },
    } = primodium.api(scene);
    const { container, obj } = createDOMContainer(id, coord);
    obj.setAlpha(minOpacity);
    obj.pointerEvents = "none";
    // obj.perspective = 800;
    // obj.rotate3d = new Phaser.Math.Vector4(1, 0, 0, 10);
    setContainer(obj);
    setContainerRef(container);

    if (noScale) return;

    const sub = zoom$.subscribe((zoom) => {
      obj.scale = 1 / zoom;
    });

    return () => sub.unsubscribe();
  }, [coord, id, scene, primodium, minOpacity, noScale]);

  useEffect(() => {
    if (!draggable) return;
    const handleMouseMove = (event: MouseEvent) => {
      if (dragging) {
        requestAnimationFrame(() => {
          const {
            camera: { screenCoordToPixelCoord },
          } = primodium.api(Scenes.Asteroid);

          const newPixelPosition = screenCoordToPixelCoord({
            x: event.clientX,
            y: event.clientY,
          });

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
  }, [dragging, draggable, dragOffset, container, primodium]);

  if (!containerRef || !container) return null;

  return ReactDOM.createPortal(
    <div
      className={`relative min-w-44 transition-opacity duration-600 ${translate} pointer-events-auto font-pixel`}
      onPointerEnter={() => container.setAlpha(1)}
      onPointerLeave={() => !dragging && container.setAlpha(minOpacity)}
    >
      <div
        className="flex absolute top-0 -translate-y-full right-0 bg-neutral/75 p-1 border-secondary text-xs items-center gap-3 justify-between w-full cursor-move"
        onMouseDown={(event) => {
          const {
            camera: { screenCoordToPixelCoord },
          } = primodium.api(scene);

          const originPixelCoord = screenCoordToPixelCoord({ x: event.clientX, y: event.clientY });
          setDragOffset({ x: originPixelCoord.x - container.x, y: originPixelCoord.y - container.y });
          setDragging(true);
        }}
      >
        {title}
        <div className="flex items-center gap-1">
          {draggable && <FaArrowsAlt className="text-secondary" />}
          {!minimized && <FaMinus className="text-secondary cursor-row-resize" onClick={() => setMinimized(true)} />}
          {minimized && <FaPlus className="text-success cursor-row-resize" onClick={() => setMinimized(false)} />}
        </div>
      </div>
      <div className={`${minimized ? "max-h-0 overflow-hidden" : ""}`}>{children}</div>
    </div>,
    containerRef
  );
};
