import { Coord } from "@latticexyz/utils";

import { useMud } from "../../context/MudContext";

import { BackgroundImage, BlockIdToKey } from "../../util/constants";
import { getTopLayerKeyPair } from "../../util/tile";

const SelectedTile: React.FC<{ tile: Coord; minimized: boolean }> = ({
  tile: selectedTile,
  minimized,
}) => {
  const { perlin } = useMud();

  const terrainTile = getTopLayerKeyPair(
    {
      x: selectedTile.x,
      y: selectedTile.y,
    },
    perlin
  );

  const Head = () => (
    <p className="text-lg font-bold mb-3">
      Tile ({selectedTile.x}, {selectedTile.y})
    </p>
  );

  if (minimized) {
    return <Head />;
  }
  return (
    <div className="ml-5 flex flex-col overflow-y-scroll scrollbar h-[19rem]">
      <Head />
      <div className="flex items-center gap-1.5 flex-col h-full w-full">
        <div
          className="inline-block w-16 h-16 flex-shrink-0"
          style={{
            backgroundImage: `url(${BackgroundImage.get(
              terrainTile.resource ? terrainTile.resource : terrainTile.terrain!
            )!})`,
            backgroundSize: "cover",
            imageRendering: "pixelated",
          }}
        />
        <b>
          {terrainTile.resource
            ? BlockIdToKey[terrainTile.resource]
            : BlockIdToKey[terrainTile.terrain!]}
        </b>
      </div>
    </div>
  );
};

export default SelectedTile;
