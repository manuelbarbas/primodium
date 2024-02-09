import { Scenes } from "@game/constants";
import { useMemo } from "react";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { Button } from "../core/Button";
import { IconLabel } from "../core/IconLabel";
import { Coord } from "@latticexyz/utils";
import { FaChevronRight } from "react-icons/fa";

export const Marker = ({ coord: _coord, imageUri }: { coord: Coord; imageUri: string }) => {
  const primodium = usePrimodium();
  const {
    hooks: { useCoordToScreenCoord },
    camera: { pan },
  } = primodium.api(Scenes.Starmap);
  // const homeAsteroid = components.ActiveRock.use()?.value ?? singletonEntity;
  const mapOpen = components.MapOpen.use()?.value ?? false;

  const { screenCoord, direction, isBounded } = useCoordToScreenCoord(_coord, true);
  const MARGIN = 150;

  const coord = useMemo(() => {
    const coord = { x: screenCoord.x, y: screenCoord.y };
    if (isBounded) {
      coord.x = Math.max(MARGIN, Math.min(window.innerWidth - MARGIN, coord.x));
      coord.y = Math.max(MARGIN, Math.min(window.innerHeight - MARGIN, coord.y));
    }

    return coord;
  }, [screenCoord, isBounded]);

  if (!mapOpen) return <></>;

  return (
    <>
      <div
        style={{ left: `calc(${coord.x}px)`, top: `calc(${coord.y}px)` }}
        className={`text-error absolute -translate-y-1/2 -translate-x-1/2`}
      >
        <Button
          className="btn-ghost p-0!"
          disabled={!isBounded}
          onClick={() => {
            pan(_coord);
          }}
        >
          <IconLabel
            imageUri={imageUri}
            className={`text-xl p-3 ${isBounded ? "border border-accent bg-secondary" : "max-w-12"}`}
          />
          {isBounded && (
            <div className="absolute inset-0 pointer-events-none" style={{ transform: `rotate(${direction}deg)` }}>
              <FaChevronRight
                size={24}
                className="text-success font-bold absolute top-1/2 -translate-y-1/2 -right-10"
              />
            </div>
          )}
        </Button>
      </div>
    </>
  );
};
