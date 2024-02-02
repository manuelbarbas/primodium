import { Scenes } from "@game/constants";
import { Coord } from "@latticexyz/utils";
import React, { useState, useEffect, ReactNode, FC } from "react";
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
}> = ({ title, scene, id, coord, children, draggable = true }) => {
  const primodium = usePrimodium();
  const [container, setContainer] = useState<Phaser.GameObjects.DOMElement>();
  const [containerRef, setContainerRef] = useState<HTMLDivElement>();
  const [minimized, setMinimized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Coord>({ x: 0, y: 0 });

  useEffect(() => {
    const {
      camera: { createDOMContainer },
    } = primodium.api(scene);
    const { container, obj } = createDOMContainer(id, coord);
    setContainer(obj);
    setContainerRef(container);
  }, [coord, id, scene, primodium]);

  useEffect(() => {
    if (!draggable) return;
    const handleMouseMove = (event: MouseEvent) => {
      if (dragging) {
        requestAnimationFrame(() => {
          const {
            camera: { screenCoordToPixelCoord },
          } = primodium.api(Scenes.Asteroid);

          const newPixelPosition = screenCoordToPixelCoord({
            x: event.clientX - dragOffset.x,
            y: event.clientY - dragOffset.y,
          });

          container?.setPosition(newPixelPosition.x, newPixelPosition.y);
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
    <div className="relative min-w-24">
      <div className="flex absolute top-0 -translate-y-full right-0 bg-neutral/75 p-1 border-secondary text-xs items-center font-mono gap-3 justify-between w-full">
        {title}
        <div className="flex items-center gap-1">
          {draggable && (
            <FaArrowsAlt
              className="text-secondary pointer-events-auto"
              onMouseDown={(event) => {
                const {
                  camera: { screenCoordToPixelCoord },
                } = primodium.api(Scenes.Asteroid);

                const originPixelCoord = screenCoordToPixelCoord({ x: event.clientX, y: event.clientY });
                setDragOffset({ x: originPixelCoord.x - container.x, y: originPixelCoord.y - container.y });
                setDragging(true);
              }}
            />
          )}
          {!minimized && <FaMinus className="text-secondary pointer-events-auto" onClick={() => setMinimized(true)} />}
          {minimized && <FaPlus className="text-success pointer-events-auto" onClick={() => setMinimized(false)} />}
        </div>
      </div>
      {!minimized && children}
    </div>,
    containerRef
  );
};
