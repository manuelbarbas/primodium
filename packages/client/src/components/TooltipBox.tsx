import { useCallback, useEffect, useRef, useState } from "react";

import { FaMinusSquare, FaPlusSquare } from "react-icons/fa";

import { EntityID, Has, HasValue } from "@latticexyz/recs";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { Coord } from "@latticexyz/utils";
import { createPerlin, Perlin } from "@latticexyz/noise";
import { SingletonID } from "@latticexyz/network";

import { useTransactionLoading } from "../context/TransactionLoadingContext";
import { useSelectedTile } from "../context/SelectedTileContext";
import { useMud } from "../context/MudContext";

import { getTopLayerKey } from "../util/tile";
import { CraftRecipe, isClaimable, isClaimableFactory } from "../util/resource";
import { BlockIdToKey, BackgroundImage } from "../util/constants";

import ClaimButton from "./action/ClaimButton";
import CraftButton from "./action/CraftButton";
import StaticResourceLabel from "./resource-box/StaticResourceLabel";
import AllResourceLabels from "./resource-box/AllResourceLabels";
import Spinner from "./Spinner";

function TooltipBox() {
  const { components, singletonIndex } = useMud();

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

  const tilesAtPosition = useEntityQuery([
    Has(components.Tile),
    HasValue(components.Position, { x: selectedTile.x, y: selectedTile.y }),
  ]);

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
  const tileColor = BackgroundImage.get(terrainTile);

  let builtTile: EntityID | undefined;
  let tileOwner: number | undefined;
  if (tilesAtPosition.length > 0 && tilesAtPosition[0] && tile && tileOwnedBy) {
    builtTile = tile.value as unknown as EntityID;
    tileOwner = tileOwnedBy.value;
  } else {
    builtTile = undefined;
    tileOwner = undefined;
  }

  // const tileLastBuiltAt = useComponentValue(
  //   components.LastBuiltAt,
  //   tilesAtPosition.length > 0 ? tilesAtPosition[0] : singletonIndex
  // );

  // const tileLastClaimedAt = useComponentValue(
  //   components.LastClaimedAt,
  //   tilesAtPosition.length > 0 ? tilesAtPosition[0] : singletonIndex
  // );

  // display actions
  const [minimized, setMinimize] = useState(false);

  const minimizeBox = () => {
    if (minimized) {
      setMinimize(false);
    } else {
      setMinimize(true);
    }
  };

  const CraftRecipeDisplay = () => {
    if (builtTile && isClaimableFactory(builtTile)) {
      const craftRecipe = CraftRecipe.get(builtTile);
      if (craftRecipe) {
        return (
          <>
            <div className="flex-row mb-1 flex">
              <div className="">Crafts</div>
              <StaticResourceLabel
                name={BlockIdToKey[craftRecipe[0].id]}
                resourceId={craftRecipe[0].id}
                count={1}
              ></StaticResourceLabel>
              <div className="">from</div>
              {craftRecipe[0].resources.map((item) => {
                return (
                  <StaticResourceLabel
                    key={BlockIdToKey[item.id]}
                    name={BlockIdToKey[item.id]}
                    resourceId={item.id}
                    count={item.amount}
                  ></StaticResourceLabel>
                );
              })}
            </div>
          </>
        );
      } else {
        return <></>;
      }
    } else {
      return <></>;
    }
  };

  // actions
  const { transactionLoading } = useTransactionLoading();

  if (!minimized) {
    return (
      <div className="z-[1000] fixed bottom-4 right-4 h-96 w-80  flex flex-col bg-gray-700 text-white shadow-xl font-mono rounded">
        <div className="mt-4 ml-5 flex flex-col overflow-y-scroll scrollbar h-64">
          <button onClick={minimizeBox} className="fixed right-9">
            <LinkIcon icon={<FaMinusSquare size="18" />} />
          </button>
          <p className="text-lg font-bold mb-3">
            Tile ({selectedTile.x}, {selectedTile.y})
          </p>
          <div className="grid grid-cols-1 gap-1.5 overflow-y-scroll scrollbar">
            <div className="flex flex-col">
              <div className="flex align-center mb-4">
                <div
                  className="inline-block w-16 h-16 flex-shrink-0"
                  style={{
                    backgroundImage: `url(${tileColor!})`,
                    backgroundSize: "cover",
                    imageRendering: "pixelated",
                  }}
                ></div>
                <div className="ml-4 flex flex-col my-auto">
                  <div className="mb-1">
                    <div>
                      <div>
                        {builtTile ? (
                          <div>
                            {BlockIdToKey[builtTile]
                              .replace(/([A-Z]+)/g, " $1")
                              .replace(/([A-Z][a-z])/g, " $1")}
                          </div>
                        ) : (
                          <div>No tile built</div>
                        )}
                        on <b>{BlockIdToKey[terrainTile]}</b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {tileOwner && (
                <div className="flex-col">
                  <div className="inline-block font-bold mb-1">Owner:</div>
                  <div className="mx-2 inline-block">
                    <div>{tileOwner.toString().slice(0, 8) + "..."}</div>
                  </div>
                </div>
              )}
              <div>
                <CraftRecipeDisplay />
              </div>
              <div className="flex-row mt-2 mb-2">
                {/* TODO: show owned resource for every resource possible */}
                {builtTile && transactionLoading && <Spinner />}
                {builtTile && !transactionLoading && (
                  <>
                    {isClaimableFactory(builtTile) && (
                      <div className="font-bold mb-1">Storage:</div>
                    )}
                    {isClaimable(builtTile) &&
                      !isClaimableFactory(builtTile) && (
                        <ClaimButton
                          builtTile={builtTile}
                          coords={selectedTile}
                        />
                      )}
                    {isClaimableFactory(builtTile) && (
                      <>
                        <ClaimButton
                          builtTile={builtTile}
                          coords={selectedTile}
                        />
                        <CraftButton x={selectedTile.x} y={selectedTile.y} />
                      </>
                    )}
                    <AllResourceLabels entityIndex={tilesAtPosition[0]} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="z-[1000] fixed bottom-4 right-4 h-14 w-64 flex flex-col bg-gray-700 text-white shadow-xl font-mono rounded">
        <div className="mt-4 ml-5 flex flex-col">
          <button onClick={minimizeBox} className="fixed right-9">
            <LinkIcon icon={<FaPlusSquare size="18" />} />
          </button>
          <p className="text-lg font-bold mb-3">
            Tile ({selectedTile.x}, {selectedTile.y})
          </p>
        </div>
      </div>
    );
  }
}

const LinkIcon = ({ icon }: { icon: any }) => (
  <div className="link-icon inline-block my-auto align-middle">{icon}</div>
);

export default TooltipBox;
