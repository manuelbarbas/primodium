import { Scenes } from "@game/constants";
import { Coord } from "@latticexyz/utils";
import { ReactNode, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { usePrimodium } from "src/hooks/usePrimodium";
// import { getDegreeDirection } from "src/util/common";

export const Marker: React.FC<{
  id: string;
  scene: Scenes;
  coord: Coord;
  children: ReactNode;
  offScreenIconUri?: string;
}> = ({ id, scene, coord, children }) => {
  const primodium = usePrimodium();
  const [marker, setMarker] = useState<Phaser.GameObjects.DOMElement>();
  const [container, setContainer] = useState<HTMLDivElement>();
  const [visible, setVisible] = useState(false);
  // const [direction, setDirection] = useState(0);
  const camera = useRef(primodium.api(scene).camera).current;

  //initialize container
  useEffect(() => {
    const { container, obj } = camera.createDOMContainer(id, coord, true);
    obj.pointerEvents = "none";
    obj.setOrigin(0.5, 0.5);
    obj.setScale(1 / camera.phaserCamera.zoom);
    //TODO: handle depet
    obj.setDepth(-1000);

    setMarker(obj);
    setContainer(container);

    const cameraCallback = (view: Phaser.Geom.Rectangle) => {
      if (view.contains(obj.x, obj.y)) {
        setVisible(true);
      }

      obj.setScale(1 / camera.phaserCamera.zoom);

      // setDirection(getDegreeDirection({ x: view.centerX, y: view.centerY }, obj));
    };

    cameraCallback(camera.phaserCamera.worldView);
    const cameraSub = camera.worldView$.subscribe(cameraCallback);

    return () => {
      obj.destroy();
      cameraSub.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coord, id]);

  //update container position on coord change
  useEffect(() => {
    if (!marker || !container) return;

    // if (!visible) {
    //   const worldView = camera.phaserCamera.worldView;
    //   const boundedCoord = {
    //     x: Phaser.Math.Clamp(marker.x, worldView.x, worldView.right),
    //     y: Phaser.Math.Clamp(marker.y, worldView.y, worldView.bottom),
    //   };
    //   marker.setPosition(boundedCoord.x, boundedCoord.y);
    //   return;
    // }

    marker.setPosition(coord.x, coord.y);
  }, [coord, visible, container, marker]);

  if (!marker || !container) return;

  return ReactDOM.createPortal(<div className={"-translate-x-1/2 -translate-y-1/2"}>{children}</div>, container);
};
