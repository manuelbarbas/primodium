import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { useEffect, useMemo } from "react";
import {
  PanZoomProvider,
  usePanzoom,
} from "src/components/shared/PanZoomProvider";
import { useMud } from "src/hooks";
import { BlockType } from "src/util/constants";
import { getTilesOfTypeInRange } from "src/util/tile";

type StarmapViewProps = {
  gridSize: number;
};

const playerPosition = { x: 0, y: 0 };

const StarmapView: React.FC<StarmapViewProps> = ({ gridSize }) => {
  const { ref, ready, pan, scale, position, viewportSize } = usePanzoom();

  const { perlin } = useMud();

  const tiles = useMemo(() => {
    return getTilesOfTypeInRange({ x: 0, y: 0 }, BlockType.Iron, 50, 2, perlin);
  }, [perlin]);

  const playerPixelCoord = useMemo(() => {
    return tileCoordToPixelCoord(playerPosition, gridSize, gridSize);
  }, [playerPosition, gridSize]);

  // Calculate the adjusted background positions for grid and tile backgrounds
  const gridBackgroundPositionX = useMemo(() => {
    return position.x * scale + viewportSize.x / 2 - (gridSize / 2) * scale;
  }, [position.x, scale, viewportSize.x, gridSize]);

  const gridBackgroundPositionY = useMemo(() => {
    return position.y * scale + viewportSize.y / 2 - (gridSize / 2) * scale;
  }, [position.y, scale, viewportSize.y, gridSize]);

  // Move to center of the screen on load
  useEffect(() => {
    if (ready) pan(0, 0, false, false);
  }, [ready]);

  return (
    <div className="relative w-full h-full bg-gray-800">
      {/* Grid Background */}
      <div
        style={{
          backgroundSize: `75px 75px`,
          opacity: 0.2,
          backgroundImage: "url(/img/backgrounds/star.webp)",
        }}
        className="absolute inset-0"
      />

      {/* Tile Background */}
      <div
        style={{
          backgroundSize: `${gridSize * scale}px ${gridSize * scale}px`,
          backgroundPosition: `${gridBackgroundPositionX}px ${gridBackgroundPositionY}px`,
          backgroundImage:
            "linear-gradient(to right, rgb(8 145 178 / 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgb(8 145 178 / 0.1) 1px, transparent 1px)",
        }}
        className="absolute inset-0"
      />

      {/* Panzoom Container */}
      <div ref={ref} className="w-full h-full ">
        <div className="relative">
          {/* Player */}
          <div
            key={`${0}-${0}`}
            style={{
              bottom: `${playerPixelCoord.y}px`,
              left: `${playerPixelCoord.x}px`,
              scale: `${Math.max(1 / scale, 1)}`,
            }}
            className="absolute w-4 h-4 bg-green-300 -translate-x-1/2 -translate-y-1/2 rounded-full flex justify-center items-center"
          >
            <p className="text-[.5rem] whitespace-nowrap  absolute -bottom-4 text-cyan-400/60">
              [You]
            </p>
          </div>

          {/* Tiles */}
          {tiles.map((tile) => {
            const pixelCoord = tileCoordToPixelCoord(tile, gridSize, gridSize);
            return (
              <div
                key={`${tile.x}-${tile.y}`}
                style={{
                  bottom: `${pixelCoord.y}px`,
                  left: `${pixelCoord.x}px`,
                }}
                className="absolute w-4 h-4 bg-red-300 -translate-x-1/2 -translate-y-1/2 rounded-full flex justify-center items-center"
              >
                <p className="text-[.5rem] whitespace-nowrap absolute -bottom-4 text-cyan-400/60">
                  [{tile.x}, {tile.y}]
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const Starmap: React.FC<StarmapViewProps> = (props) => {
  return (
    <PanZoomProvider>
      <StarmapView {...props} />
    </PanZoomProvider>
  );
};
