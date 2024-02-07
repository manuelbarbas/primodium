import { Scenes } from "@game/constants";
import { Coord } from "@latticexyz/utils";
import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { FaLock, FaLockOpen, FaMinus, FaPlus, FaTimes } from "react-icons/fa";
import { RiPushpinFill, RiUnpinFill } from "react-icons/ri";
import { usePersistentStore } from "src/game/stores/PersistentStore";
import { usePrimodium } from "src/hooks/usePrimodium";

let pinnedDepth = 0;
let unpinnedDepth = 10000;

export const Content: FC<{
  id: string;
  title?: string;
  onDoubleClick?: () => void;
  onMouseDown?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onPin?: () => void;
  onUnpin?: () => void;
  onLock?: () => void;
  onUnlock?: () => void;
  pinned: boolean;
  minimized: boolean;
  children?: ReactNode;
  origin:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center"
    | "center-left"
    | "center-right"
    | "center-top"
    | "center-bottom";
  locked?: boolean;
}> = ({
  id,
  title,
  onClose,
  onMinimize,
  onMaximize,
  onDoubleClick,
  onMouseDown,
  onPointerLeave,
  onPointerEnter,
  pinned,
  minimized,
  onPin,
  onUnpin,
  children,
  origin,
  locked,
  onLock,
  onUnlock,
}) => {
  const [uiScale] = usePersistentStore((state) => [state.uiScale]);

  // Calculate translate values based on 'origin'
  const { translateX, translateY, transformOrigin } = useMemo(() => {
    let translateX = "0px";
    let translateY = "0px";
    let transformOriginValue = "center";

    switch (origin) {
      case "top-left":
        transformOriginValue = "top left";
        break;
      case "top-right":
        translateX = "-100%";
        transformOriginValue = "top right";
        break;
      case "bottom-left":
        translateY = "-100%";
        transformOriginValue = "bottom left";
        break;
      case "bottom-right":
        translateX = "-100%";
        translateY = "-100%";
        transformOriginValue = "bottom right";
        break;
      case "center":
        translateX = "-50%";
        translateY = "-50%";
        transformOriginValue = "center";
        break;
      case "center-right":
        translateX = "-100%";
        translateY = "-50%";
        transformOriginValue = "center right";
        break;
      case "center-left":
        translateY = "-50%";
        transformOriginValue = "center left";
        break;
      case "center-top":
        translateX = "-50%";
        transformOriginValue = "top";
        break;
      case "center-bottom":
        translateX = "-50%";
        translateY = "-100%";
        transformOriginValue = "bottom";
        break;
    }

    return { translateX, translateY, transformOrigin: transformOriginValue };
  }, [origin]);

  return (
    <div
      id={id + "_content"}
      style={{
        transform: `translate(${translateX}, ${translateY}) scale(${!locked ? uiScale : 1})`,
        transformOrigin: transformOrigin,
      }}
      className={`relative min-w-44 transition-opacity duration-600 pointer-events-auto font-pixel select-none ${
        !pinned ? "drop-shadow-hard" : ""
      }`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div
        className={`flex p-1 border-secondary text-xs items-center gap-3 justify-between w-full cursor-move ${
          locked ? "bg-error" : pinned ? "bg-neutral/75" : "bg-secondary"
        }`}
        onDoubleClick={onDoubleClick}
        onMouseDown={onMouseDown}
      >
        {title}
        <div className="flex items-center gap-1">
          {
            <>
              {!pinned && onPin && <RiPushpinFill className="cursor-crosshair" onClick={onPin} />}
              {pinned && onUnpin && <RiUnpinFill className="cursor-crosshair" onClick={onUnpin} />}
            </>
          }
          {locked && onUnlock && <FaLock className="cursor-pointer" onClick={onUnlock} />}
          {!locked && onLock && <FaLockOpen className="cursor-pointer" onClick={onLock} />}
          {!minimized && onMinimize && <FaMinus className="cursor-n-resize" onClick={onMinimize} />}
          {minimized && onMaximize && <FaPlus className="cursor-s-resize" onClick={onMaximize} />}
          {onClose && <FaTimes className="cursor-pointer" onClick={onClose} />}
        </div>
      </div>

      <div className={`bg-base-200 min-w-72 border border-t-success border-secondary ${minimized ? "opacity-0" : ""}`}>
        {children}
      </div>
    </div>
  );
};

export const Pane: FC<{
  id: string;
  title?: string;
  defaultPinned?: boolean;
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
  defaultLocked?: boolean;
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
  defaultPinned = false,
  defaultLocked = false,
  onClose,
}) => {
  const primodium = usePrimodium();
  const [paneInfo, setPane, removePane] = usePersistentStore((state) => [state.panes, state.setPane, state.removePane]);
  const [container, setContainer] = useState<Phaser.GameObjects.DOMElement>();
  const [containerRef, setContainerRef] = useState<HTMLDivElement>();
  const [minimized, setMinimized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Coord>({ x: 0, y: 0 });
  const [pinned, setPinned] = useState(paneInfo[id]?.pinned ?? (scene === Scenes.UI ? false : defaultPinned));
  const [locked, setLocked] = useState(paneInfo[id]?.locked ?? defaultLocked);
  const [coord, setCoord] = useState<Coord>(paneInfo[id]?.coord ?? defaultCoord);

  const [camera, uiCamera] = useMemo(() => {
    const { camera } = primodium.api(scene);
    const { camera: uiCamera } = primodium.api(Scenes.UI);

    return [camera, uiCamera];
  }, [primodium, scene]);

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

  // reset on double click to default
  const handleReset = useCallback(() => {
    setPinned(defaultPinned);
    setLocked(defaultLocked);
    setCoord(defaultCoord);
    setMinimized(false);
    setDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setPane(id, defaultCoord, defaultPinned, defaultLocked);

    // set
    const newContainer = createContainer(defaultPinned ? camera : uiCamera, defaultCoord, true);
    newContainer.setDepth(defaultPinned ? pinnedDepth : unpinnedDepth);
    newContainer.setAlpha(defaultPinned ? minOpacity : 1);
  }, [defaultPinned, defaultCoord, setPane, id, createContainer, camera, uiCamera, minOpacity, defaultLocked]);

  // calculate drag offset, set depth and set dragging flag
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!container) return;

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
    },
    [setDragOffset, container, pinned, uiCamera, camera, setDragging]
  );

  const handlePin = useCallback(() => {
    if (!container) return;

    setPinned(true);
    const worldCoord = camera.screenCoordToWorldCoord({ x: container.x, y: container.y });
    const newContainer = createContainer(camera, worldCoord, true);
    newContainer.setDepth(pinnedDepth);
    newContainer.setAlpha(1);
    if (persist) {
      setPane(id, worldCoord, true, false);
    }
  }, [setPinned, camera, container, createContainer, persist, setPane, id]);

  const handleUnpin = useCallback(() => {
    if (!container) return;

    setPinned(false);
    const screenCoord = camera.worldCoordToScreenCoord({ x: container.x, y: container.y });
    const newContainer = createContainer(uiCamera, screenCoord, true);
    newContainer.setDepth(unpinnedDepth);
    newContainer.setAlpha(1);
    if (persist) {
      setPane(id, screenCoord, false, false);
    }
  }, [setPinned, camera, container, createContainer, uiCamera, persist, setPane, id]);

  const toggleMinimize = useCallback(() => {
    setMinimized(!minimized);
  }, [minimized, setMinimized]);

  const handleLock = useCallback(() => {
    setLocked(true);
    persist && setPane(id, coord, pinned, true);
  }, [setLocked, persist, setPane, id, coord, pinned]);

  const handleUnlock = useCallback(() => {
    const contentRef = document.getElementById(id + "_content");
    if (!contentRef) return;
    const contentBounds = contentRef.getBoundingClientRect();

    let translatedX = 0;
    let translatedY = 0;

    switch (origin) {
      case "top-right":
        translatedX = contentBounds.width; // Entirely to the left
        break;
      case "bottom-left":
        translatedY = contentBounds.height; // Entirely up
        break;
      case "bottom-right":
        translatedX = contentBounds.width; // Entirely to the left
        translatedY = contentBounds.height; // Entirely up
        break;
      case "center":
        translatedX = contentBounds.width / 2; // Center horizontally
        translatedY = contentBounds.height / 2; // Center vertically
        break;
      case "center-right":
        translatedX = contentBounds.width; // Entirely to the left
        translatedY = contentBounds.height / 2; // Center vertically
        break;
      case "center-left":
        translatedY = contentBounds.height / 2; // Center vertically
        break;
      case "center-top":
        translatedX = contentBounds.width / 2; // Center horizontally
        break;
      case "center-bottom":
        translatedX = contentBounds.width / 2; // Center horizontally
        translatedY = contentBounds.height; // Entirely up
        break;
    }

    const screenCoord = {
      x: contentBounds.left + window.scrollX + translatedX,
      y: contentBounds.top + window.scrollY + translatedY,
    };

    // const screenCoord = camera.worldCoordToScreenCoord({ x: container.x, y: container.y });
    const newContainer = createContainer(uiCamera, screenCoord, true);
    newContainer.setDepth(unpinnedDepth);
    newContainer.setAlpha(1);

    setLocked(false);
    setPinned(false);
    persist && setPane(id, screenCoord, false, false);
  }, [setLocked, id, setPane, persist, createContainer, uiCamera, origin]);

  //initialize phaser container
  useEffect(() => {
    createContainer(pinned ? camera : uiCamera, coord, true);

    return () => {
      if (container) container.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coord]);

  //scale container with camera zoom. Do not scale if pinned
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

  //handle dragging
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

        persist && setPane(id, container, pinned, false);
      }

      setDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, draggable, dragOffset, container, pinned, camera, uiCamera, id, setPane, persist]);

  useEffect(() => {
    const handleResize = () => {
      if (!container || pinned) return;

      if (!uiCamera.phaserCamera.worldView.contains(container.x, container.y)) {
        handleReset();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [pinned, container, camera, defaultCoord, id, removePane, createContainer, uiCamera, minOpacity, handleReset]);

  const handlePointerEnter = useCallback(() => {
    if (!container) return;

    if (pinned) {
      container.setAlpha(1);
    }
  }, [pinned, container]);

  const handlePointerLeave = useCallback(() => {
    if (!container) return;

    if (pinned && !dragging) {
      container.setAlpha(minOpacity);
    }
  }, [pinned, dragging, container, minOpacity]);

  if (!containerRef || !container || !visible) return null;

  if (locked)
    return (
      <Content
        id={id}
        title={title}
        minimized={minimized}
        pinned={false}
        origin={"top-left"}
        onClose={onClose}
        locked={locked}
        onLock={handleLock}
        onUnlock={handleUnlock}
        onMinimize={toggleMinimize}
        onMaximize={toggleMinimize}
      >
        {children}
      </Content>
    );

  return ReactDOM.createPortal(
    <Content
      id={id}
      title={title}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      minimized={minimized}
      onPin={pinnable && scene !== Scenes.UI ? handlePin : undefined}
      onUnpin={pinnable && scene !== Scenes.UI ? handleUnpin : undefined}
      pinned={pinned}
      // onLock={handleReset}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleReset}
      onMinimize={toggleMinimize}
      onMaximize={toggleMinimize}
      onClose={onClose}
      onLock={handleLock}
      origin={origin}
    >
      {children}
    </Content>,
    containerRef
  );
};
