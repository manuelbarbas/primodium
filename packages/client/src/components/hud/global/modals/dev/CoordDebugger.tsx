import { useEffect, useState } from "react";
import { FaSquare, FaEyeSlash, FaLocationArrow, FaLayerGroup } from "react-icons/fa";
import { FaSquareXmark } from "react-icons/fa6";
import { Coord } from "engine/types";
import { components } from "@/network/components";
import { Button } from "@/components/core/Button";
import { useGame } from "@/hooks/useGame";
import { Mode } from "@/util/constants";

export const CoordDebugger = () => {
  const DEV = import.meta.env.PRI_DEV === "true";
  const [show, setShow] = useState(false);

  const selectedMode = components.SelectedMode.use()?.value;
  const asteroidMode = selectedMode === Mode.Asteroid || selectedMode === Mode.Spectate;
  const starmapMode = selectedMode === Mode.Starmap;

  if (!DEV || (!asteroidMode && !starmapMode)) return null;

  return (
    <div className="absolute bottom-14 right-4 flex flex-col gap-1 items-end pointer-events-auto z-[1000000] text-xs">
      <Button variant="ghost" onClick={() => setShow(!show)}>
        {show ? <FaEyeSlash size={16} /> : <FaLocationArrow size={16} opacity={0.7} />}
      </Button>
      {show && (asteroidMode ? <CoordDebuggerAsteroid /> : <CoordDebuggerStarmap />)}
    </div>
  );
};

export const CoordDebuggerAsteroid = () => {
  const hoverTile = components.HoverTile.use();

  return (
    <div className="grid grid-cols-[12px_40px_48px] items-center gap-1 bg-black bg-opacity-50 p-2 rounded-sm">
      <FaSquareXmark />
      <CoordCaption caption="tile" />
      <CoordDisplay coord={hoverTile} />
    </div>
  );
};

export const CoordDebuggerStarmap = () => {
  const scene = useGame().STARMAP;

  const [pixelCoord, setPixelCoord] = useState<Coord | undefined>(undefined);
  const [tileCoord, setTileCoord] = useState<Coord | undefined>(undefined);
  const [chunkCoord, setChunkCoord] = useState<Coord | undefined>(undefined);

  useEffect(() => {
    const pointerMoveSub = scene.input.pointermove$.pipe().subscribe((event) => {
      const pixelCoord = { x: event.worldX, y: event.worldY };
      console.log("pixelCoord", pixelCoord);

      setPixelCoord(Object.fromEntries(Object.entries(pixelCoord).map(([k, v]) => [k, Math.round(v)])) as Coord);
      setTileCoord(scene.utils.pixelCoordToTileCoord({ x: pixelCoord.x, y: -pixelCoord.y }));
      setChunkCoord(scene.utils.pixelCoordToChunkCoord({ x: pixelCoord.x, y: -pixelCoord.y }));
    });

    return () => pointerMoveSub.unsubscribe();
  }, []);

  return (
    <div className="grid grid-cols-[12px_60px_minmax(120px,auto)] items-center gap-2 bg-black bg-opacity-70 p-2 rounded-sm">
      <FaSquare />
      <CoordCaption caption="px" />
      <CoordDisplay coord={pixelCoord} />
      <FaSquareXmark />
      <CoordCaption caption="tile" />
      <CoordDisplay coord={tileCoord} />
      <FaLayerGroup />
      <CoordCaption caption="chunk" />
      <CoordDisplay coord={chunkCoord} />
    </div>
  );
};

const CoordCaption = ({ caption }: { caption: string }) => <span className="mr-2 opacity-70">{caption}</span>;
const CoordDisplay = ({ coord }: { coord?: Coord }) =>
  coord ? `${coord.x}, ${coord.y}` : <span className="opacity-50">—</span>;
