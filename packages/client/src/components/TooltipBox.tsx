import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FaMinusSquare, FaPlusSquare } from "react-icons/fa";

import { EntityID, Has, HasValue } from "@latticexyz/recs";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { Coord } from "@latticexyz/utils";
import { createPerlin, Perlin } from "@latticexyz/noise";
import { GodID as SingletonID } from "@latticexyz/network";
import { useSelectedTile } from "../context/SelectedTileContext";

import { components } from "..";
import { singletonIndex } from "..";
import { getTopLayerKey } from "../util/tile";

import { BlockIdToKey, BlockColors } from "../util/constants";

function TooltipBox() {
  // Initialize Perlin to fetch the tile information
  const [initialized, setInitialized] = useState(false);
  const perlinRef = useRef(null as null | Perlin);

  useEffect(() => {
    createPerlin().then((perlin: Perlin) => {
      perlinRef.current = perlin;
      setInitialized(true);
    });
  }, []);

  const getTopLayerKeyHelper = useCallback(
    (coord: Coord) => {
      if (!initialized || perlinRef.current === null) {
        return SingletonID;
      }
      if (perlinRef.current !== null) {
        const perlin = perlinRef.current;
        return getTopLayerKey(coord, perlin);
      } else {
        return SingletonID;
      }
    },
    [initialized]
  );

  // Get information on the selected tile
  const { selectedTile } = useSelectedTile();

  const tilesAtPosition = useEntityQuery(
    useMemo(
      () => [
        Has(components.Tile),
        HasValue(components.Position, { x: selectedTile.x, y: selectedTile.y }),
      ],
      [components.Tile, components.Position, selectedTile]
    )
  );

  const tile = useComponentValue(
    components.Tile,
    tilesAtPosition.length > 0 ? tilesAtPosition[0] : singletonIndex
  );

  const tileOwnedBy = useComponentValue(
    components.OwnedBy,
    tilesAtPosition.length > 0 ? tilesAtPosition[0] : singletonIndex
  );

  const terrainTile = getTopLayerKeyHelper({
    x: selectedTile.x,
    y: selectedTile.y,
  });

  //change this to BackgroundImage.get (and import it from utils) if you want this to be an image
  const tileColor = BlockColors.get(terrainTile);

  const tooltipThumbnail = {
    //change this to img src and all that if you want this to be an image
    backgroundColor: tileColor,
  };

  let builtTile: EntityID | undefined;
  let tileOwner: number | undefined;
  if (tilesAtPosition.length > 0 && tilesAtPosition[0] && tile && tileOwnedBy) {
    builtTile = tile.value as unknown as EntityID;
    tileOwner = tileOwnedBy.value;
  } else {
    builtTile = undefined;
    tileOwner = undefined;
  }

  useEffect(() => {
    console.log(builtTile);
  }, [selectedTile]);

  const [minimized, setMinimize] = useState(false);

  const minimizeBox = () => {
    if (minimized) {
      setMinimize(false);
    } else {
      setMinimize(true);
    }
  };

  if (!minimized) {
    return (
      <div className="z-[999] fixed bottom-4 right-4 h-48 w-64 flex flex-col bg-gray-700 text-white shadow-xl font-mono rounded">
        <div className=" mt-4 ml-5 flex flex-col">
          <button onClick={minimizeBox} className="fixed right-9">
            <LinkIcon icon={<FaMinusSquare size="18" />} />
          </button>
          <p className="text-lg font-bold mb-2">Selected Tile</p>
          <div className="flex flex-col">
            <div className="flex align-center mb-2">
              <div
                className="inline-block w-16 h-16"
                style={tooltipThumbnail}
              ></div>
              <div className="ml-4 flex flex-col my-auto">
                <div>
                  {builtTile ? (
                    <div>{BlockIdToKey[builtTile]}</div>
                  ) : (
                    <div>No tile built</div>
                  )}
                  on {BlockIdToKey[terrainTile]}
                </div>
              </div>
            </div>
            <div className="flex-row">
              <div className="flex font-bold mb-1">Owner:</div>
              <div className="flex">
                {tileOwner ? (
                  <div>{tileOwner.toString().slice(0, 16) + "..."}</div>
                ) : (
                  <div>None</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="z-[999] fixed bottom-4 right-4 h-14 w-64 flex flex-col bg-gray-700 text-white shadow-xl font-mono rounded">
        <div className=" mt-4 ml-5 flex flex-col">
          <button onClick={minimizeBox} className="fixed right-9">
            <LinkIcon icon={<FaPlusSquare size="18" />} />
          </button>
          <p className="text-lg font-bold mb-3">Selected Tile</p>
        </div>
      </div>
    );
  }
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block my-auto align-middle">{icon}</div>
);

export default TooltipBox;
