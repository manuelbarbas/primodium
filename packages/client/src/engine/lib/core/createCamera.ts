import { Gesture } from "@use-gesture/vanilla";
import { BehaviorSubject, map, scan, Subject, throttleTime } from "rxjs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  Coord,
  GestureState,
  ObjectPool,
} from "@latticexyz/phaserx/dist/types";
import { CameraConfig } from "../../types";

export function createCamera(
  phaserCamera: Phaser.Cameras.Scene2D.Camera,
  options: CameraConfig
) {
  // Stop default gesture events to not collide with use-gesture
  // https://github.com/pmndrs/use-gesture/blob/404e2b2ac145a45aff179c1faf5097b97414731c/documentation/pages/docs/gestures.mdx#about-the-pinch-gesture
  document.addEventListener("gesturestart", (e) => e.preventDefault());
  document.addEventListener("gesturechange", (e) => e.preventDefault());

  const worldView$ = new BehaviorSubject<
    Phaser.Cameras.Scene2D.Camera["worldView"]
  >(phaserCamera.worldView);
  const zoom$ = new BehaviorSubject<number>(phaserCamera.zoom);
  const wheelStream$ = new Subject<GestureState<"onWheel">>();
  const pinchStream$ = new Subject<GestureState<"onPinch">>();
  const dragStream$ = new Subject<GestureState<"onDrag">>();

  const gesture = new Gesture(
    phaserCamera.scene.game.canvas,
    {
      onPinch: (state) => pinchStream$.next(state),
      onWheel: (state) => wheelStream$.next(state),
      onDrag: (state) => dragStream$.next(state),
    },
    {}
  );

  const onResize = () => {
    requestAnimationFrame(() => worldView$.next(phaserCamera.worldView));
  };
  phaserCamera.scene.scale.addListener("resize", onResize);

  function setZoom(zoom: number) {
    phaserCamera.setZoom(zoom);
    worldView$.next(phaserCamera.worldView);
    zoom$.next(zoom);
  }

  const pinchSub = pinchStream$
    .pipe(
      throttleTime(10),
      map((state) => {
        // Because this event stream is throttled, we're dropping events which contain delta data, so we need to calculate the delta ourselves.
        const zoom = zoom$.getValue();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const delta = state.offset[0] - zoom;
        const scaledDelta = delta * options.pinchSpeed;
        // console.log(zoom, scaledDelta);
        return zoom + scaledDelta;
      }), // Compute pinch speed
      map((zoom) => Math.min(Math.max(zoom, options.minZoom), options.maxZoom)), // Limit zoom values
      scan((acc, curr) => [acc[1], curr], [1, 1]) // keep track of the last value to offset the map position (not implemented yet)
    )
    .subscribe(([, zoom]) => {
      // Set the gesture zoom state to the current zoom value to avoid zooming beyond the max values
      if (gesture._ctrl.state.pinch) gesture._ctrl.state.pinch.offset[0] = zoom;
      setZoom(zoom);
    });

  function ignore(objectPool: ObjectPool, ignore: boolean) {
    objectPool.ignoreCamera(phaserCamera.id, ignore);
  }

  function centerOnCoord(
    tileCoord: Coord,
    tileWidth: number,
    tileHeight: number
  ) {
    const pixelCoord = tileCoordToPixelCoord(tileCoord, tileWidth, tileHeight);
    centerOn(pixelCoord.x, pixelCoord.y);
  }

  function centerOn(x: number, y: number) {
    phaserCamera.centerOn(x, y);
    requestAnimationFrame(() => worldView$.next(phaserCamera.worldView));
  }

  function setScroll(x: number, y: number) {
    phaserCamera.setScroll(x, y);
    requestAnimationFrame(() => worldView$.next(phaserCamera.worldView));
  }

  return {
    phaserCamera,
    worldView$,
    zoom$,
    ignore,
    dispose: () => {
      pinchSub.unsubscribe();
      dragStream$.unsubscribe();
      pinchStream$.unsubscribe();
      wheelStream$.unsubscribe();
      zoom$.unsubscribe();
      gesture.destroy();
      phaserCamera.scene.scale.removeListener("resize", onResize);
    },
    centerOnCoord,
    centerOn,
    setScroll,
    setZoom,
  };
}
