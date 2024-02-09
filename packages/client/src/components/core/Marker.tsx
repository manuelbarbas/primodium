import { Scenes } from "@game/constants";
import { Coord } from "@latticexyz/utils";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { usePrimodium } from "src/hooks/usePrimodium";
import { calculateAngleBetweenPoints } from "src/util/common";
import { Button } from "./Button";
import { IconLabel } from "./IconLabel";
import { FaChevronRight } from "react-icons/fa";
import { pixelCoordToTileCoord } from "@latticexyz/phaserx";

const BoundedMarker: React.FC<{ scene: Scenes; coord: Coord; iconUri: string; direction: number }> = ({
  coord,
  scene,
  iconUri,
  direction,
}) => {
  const primodium = usePrimodium();

  const handleClick = useCallback(() => {
    const {
      camera: { pan },
      scene: { getConfig },
    } = primodium.api(scene);

    const config = getConfig(scene);

    const tileCoord = pixelCoordToTileCoord(
      { x: coord.x, y: -coord.y },
      config.tilemap.tileWidth,
      config.tilemap.tileHeight
    );

    pan(tileCoord);
  }, [coord, primodium, scene]);

  return (
    <Button className="border border-secondary hover:bg-secondary hover:border-accent" onClick={handleClick}>
      <IconLabel imageUri={iconUri} className={`text-xl drop-shadow-hard`} />
      <div className="absolute inset-0 pointer-events-none" style={{ transform: `rotate(${direction}deg)` }}>
        <FaChevronRight size={24} className="text-success font-bold absolute top-1/2 -translate-y-1/2 -right-10" />
      </div>
    </Button>
  );
};

export const Marker: React.FC<{
  id: string;
  scene: Scenes;
  coord: Coord;
  children: ReactNode;
  offScreenIconUri?: string;
}> = ({ id, scene, coord, children, offScreenIconUri }) => {
  const primodium = usePrimodium();
  const [marker, setMarker] = useState<Phaser.GameObjects.DOMElement>();
  const [container, setContainer] = useState<HTMLDivElement>();
  const [visible, setVisible] = useState(true);
  const [direction, setDirection] = useState(0);
  const camera = useRef(primodium.api(scene).camera).current;
  const uiCamera = useRef(primodium.api(Scenes.UI).camera).current;

  const createContainer = useCallback((_camera: typeof camera, id: string, coord: Coord) => {
    const { container, obj } = _camera.createDOMContainer(id, coord, true);
    obj.pointerEvents = "none";
    obj.setOrigin(0.5, 0.5);
    obj.setScale(1 / _camera.phaserCamera.zoom);

    setMarker(obj);
    setContainer(container);
    return { container, obj };
  }, []);

  //setup container on correct scene
  useEffect(() => {
    const { obj } = createContainer(visible ? camera : uiCamera, id, coord);

    return () => {
      obj.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coord, id, visible]);

  useEffect(() => {
    if (!marker || !container) return;

    const cameraCallback = (view: Phaser.Geom.Rectangle) => {
      if (offScreenIconUri) {
        const shouldVisible = view.contains(coord.x, coord.y);
        if (shouldVisible !== visible) {
          setVisible(shouldVisible);
        }

        if (!visible) {
          const a = window.innerWidth / 3; // major axis
          const b = window.innerHeight / 3; // minor axis

          const { radian, degree } = calculateAngleBetweenPoints(
            { x: view.centerX, y: view.centerY },
            { x: coord.x, y: coord.y }
          );

          //convert to ellipse coordinates
          const r = Math.sqrt(1 / (Math.cos(radian) ** 2 / a ** 2 + Math.sin(radian) ** 2 / b ** 2));

          const markerX = r * Math.cos(radian) + window.innerWidth / 2;
          const markerY = r * Math.sin(radian) + window.innerHeight / 2;

          // Set the marker position
          marker.setPosition(markerX, markerY);

          setDirection(degree);

          return;
        }
      }

      marker.setScale(1 / camera.phaserCamera.zoom);
    };

    cameraCallback(camera.phaserCamera.worldView);
    const cameraSub = camera.worldView$.subscribe(cameraCallback);

    marker.setPosition(coord.x, coord.y);

    return () => {
      cameraSub.unsubscribe();
    };
  }, [coord, visible, container, marker, camera, offScreenIconUri]);

  if (!marker || !container) return;

  return ReactDOM.createPortal(
    <div className={"-translate-x-1/2 -translate-y-1/2"}>
      {!visible && offScreenIconUri && (
        <BoundedMarker scene={scene} coord={coord} iconUri={offScreenIconUri} direction={direction} />
      )}
      {(visible || !offScreenIconUri) && children}
    </div>,
    container
  );
};
