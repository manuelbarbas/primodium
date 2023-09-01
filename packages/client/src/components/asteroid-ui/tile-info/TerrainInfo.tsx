import { Coord } from "@latticexyz/utils";
import { BackgroundImage, BlockType } from "src/util/constants";
import { getResourceKey } from "src/util/tile";
import { getBlockTypeName } from "src/util/common";
import { useMemo } from "react";

export const TerrainInfo: React.FC<{ coord: Coord }> = ({ coord }) => {
  const resource = getResourceKey(coord);

  const name = useMemo(() => {
    if (!resource) return;

    const name = getBlockTypeName(resource);

    if (name === "Air") return;

    return name;
  }, [resource]);

  if (!name) return null;

  return (
    <div className="flex flex-col w-fit">
      <div className="flex flex-col justify-center items-center w-full border border-slate-200 ring ring-yellow-700/20 rounded-md bg-slate-900 p-2">
        <div className="relative flex items-center gap-2">
          <img
            src={BackgroundImage.get(BlockType.Regolith)![0]}
            className="w-16 h-16 pixel-images border-2 border-cyan-700 rounded-md"
          />
          {resource && (
            <img
              src={
                BackgroundImage.has(resource)
                  ? BackgroundImage.get(resource)![0]
                  : undefined
              }
              className="absolute top-0 w-16 h-16 pixel-images"
            />
          )}
          <div>
            <p className="flex items-center text-center border border-cyan-700 bg-slate-700 rounded-md p-1 text-sm ">
              <b>{name}</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
