import { Coord } from "@latticexyz/utils";
import { useMud } from "src/context/MudContext";
import { BackgroundImage, BlockIdToKey } from "src/util/constants";
import { getTopLayerKeyPair } from "src/util/tile";
import Header from "./Header";

export const TerrainInfo: React.FC<{ coord: Coord }> = ({ coord }) => {
  const { perlin } = useMud();
  const terrainPair = getTopLayerKeyPair(coord, perlin);

  return (
    <>
      <Header content={`(${coord.x}, ${coord.y})`} />

      <div className="relative border-4 border-t-yellow-400 border-x-yellow-500 border-b-yellow-600 ring-4 ring-gray-800 crt">
        <img
          src={
            BackgroundImage.get(terrainPair.terrain) !== undefined
              ? BackgroundImage.get(terrainPair.terrain)![0]
              : undefined
          }
          className="w-16 h-16 pixel-images"
        />
        {terrainPair.resource && (
          <img
            src={
              BackgroundImage.get(terrainPair.resource) !== undefined
                ? BackgroundImage.get(terrainPair.resource)![0]
                : undefined
            }
            className="absolute top-0 w-16 h-16 pixel-images"
          />
        )}
        <div className="absolute flex items-center -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 border border-cyan-600 px-1 crt">
          <p>
            {BlockIdToKey[terrainPair.resource ?? terrainPair.terrain]
              .replace(/([A-Z]+)/g, " $1")
              .replace(/([A-Z][a-z])/g, " $1")}
          </p>
        </div>
      </div>
    </>
  );
};
