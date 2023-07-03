import { useCallback, useEffect, useRef, useState, memo } from "react";

import { FaMinusSquare, FaPlusSquare } from "react-icons/fa";

import { EntityID, Has, HasValue } from "@latticexyz/recs";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { Coord } from "@latticexyz/utils";
import { createPerlin, Perlin } from "@latticexyz/noise";
import { BigNumber } from "ethers";

import { useMud } from "../context/MudContext";

import { getTopLayerKeyPair } from "../util/tile";
import {
  CraftRecipe,
  isClaimable,
  isClaimableFactory,
  isMainBase,
} from "../util/resource";
import {
  BlockIdToKey,
  BackgroundImage,
  ResourceImage,
} from "../util/constants";
import { primodium } from "@game/api";

import { useGameStore } from "../store/GameStore";
import { getBuildingMaxHealth } from "../util/health";
import ClaimButton from "./action/ClaimButton";
import AllResourceLabels from "./resource-box/AllResourceLabels";
import ResourceIconTooltip from "./shared/ResourceIconTooltip";
import ClaimCraftButton from "./action/ClaimCraftButton";

function TooltipBox() {
  const network = useMud();
  const { components, singletonIndex } = network;

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
        return { terrain: null, resource: null };
      }
      if (perlinRef.current !== null) {
        const perlin = perlinRef.current;
        return getTopLayerKeyPair(coord, perlin);
      } else {
        return { terrain: null, resource: null };
      }
    },
    [initialized]
  );

  // Get information on the selected tile
  const selectedTile = primodium.hooks.useSelectedTile(network);

  const tilesAtPosition = useEntityQuery(
    [
      Has(components.Tile),
      HasValue(components.Position, { x: selectedTile.x, y: selectedTile.y }),
    ],
    { updateOnValueChange: true }
  );

  const tile = useComponentValue(
    components.Tile,
    tilesAtPosition.length > 0 ? tilesAtPosition[0] : singletonIndex
  );

  const tileOwnedBy = useComponentValue(
    components.OwnedBy,
    tilesAtPosition.length > 0 ? tilesAtPosition[0] : singletonIndex
  );

  const tileHealth = useComponentValue(
    components.Health,
    tilesAtPosition.length > 0 ? tilesAtPosition[0] : singletonIndex
  );

  const terrainTile = getTopLayerKeyHelper({
    x: selectedTile.x,
    y: selectedTile.y,
  });

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
  const [minimized, setMinimize] = useState(true);

  const minimizeBox = useCallback(() => {
    if (minimized) {
      setMinimize(false);
    } else {
      setMinimize(true);
    }
  }, [minimized]);

  const CraftRecipeDisplay = memo(() => {
    if (builtTile && isClaimableFactory(builtTile)) {
      const craftRecipe = CraftRecipe.get(builtTile);
      if (craftRecipe) {
        return (
          <p>
            {craftRecipe[0].resources.map((item) => {
              return (
                <>
                  <ResourceIconTooltip
                    key={BlockIdToKey[item.id]}
                    image={ResourceImage.get(item.id)!}
                    name={BlockIdToKey[item.id]}
                    resourceId={item.id}
                    amount={item.amount}
                    inline
                  ></ResourceIconTooltip>
                  &nbsp;
                </>
              );
            })}
            &rarr;&nbsp;
            <ResourceIconTooltip
              name={BlockIdToKey[craftRecipe[0].id]}
              image={ResourceImage.get(craftRecipe[0].id)!}
              resourceId={craftRecipe[0].id}
              amount={1}
              inline
            ></ResourceIconTooltip>
          </p>
        );
      } else {
        return <></>;
      }
    } else {
      return <></>;
    }
  });

  // actions
  const [transactionLoading] = useGameStore((state) => [
    state.transactionLoading,
  ]);

  if (!minimized) {
    return (
      <div className="z-[1000] viewport-container fixed bottom-4 right-4 h-96 w-80  flex flex-col bg-gray-700 text-white shadow-xl font-mono rounded">
        <div className="mt-4 ml-5 flex flex-col overflow-y-scroll scrollbar h-[19rem]">
          <button
            id="minimize-button-tooltip-box"
            onClick={minimizeBox}
            className="viewport-container fixed right-9"
          >
            <LinkIcon icon={<FaMinusSquare size="18" />} />
          </button>
          <p className="text-lg font-bold mb-3">
            Tile ({selectedTile.x}, {selectedTile.y})
          </p>
          <div className="grid grid-cols-1 gap-1.5 overflow-y-scroll scrollbar">
            <div className="flex flex-col">
              <div className="flex align-center mb-4">
                {builtTile ? (
                  <div
                    className="inline-block w-16 h-16 flex-shrink-0"
                    style={{
                      backgroundImage: `url(${BackgroundImage.get(
                        builtTile
                      )!})`,
                      backgroundSize: "cover",
                      imageRendering: "pixelated",
                    }}
                  ></div>
                ) : (
                  <div
                    className="inline-block w-16 h-16 flex-shrink-0"
                    style={{
                      backgroundImage: `url(${BackgroundImage.get(
                        terrainTile.resource
                          ? terrainTile.resource
                          : terrainTile.terrain!
                      )!})`,
                      backgroundSize: "cover",
                      imageRendering: "pixelated",
                    }}
                  ></div>
                )}
                <div className="ml-4 flex flex-col my-auto">
                  <div className="mb-1">
                    <div>
                      <div>
                        {builtTile ? (
                          <>
                            <b>
                              {BlockIdToKey[builtTile]
                                .replace(/([A-Z]+)/g, " $1")
                                .replace(/([A-Z][a-z])/g, " $1")}
                            </b>
                            <br />
                            {terrainTile.resource && (
                              <>
                                <img
                                  className="inline-block mr-2"
                                  src={BackgroundImage.get(
                                    terrainTile.resource
                                  )}
                                />
                                {BlockIdToKey[terrainTile.resource]}
                              </>
                            )}
                          </>
                        ) : (
                          <b>
                            {terrainTile.resource
                              ? BlockIdToKey[terrainTile.resource]
                              : BlockIdToKey[terrainTile.terrain!]}
                          </b>
                        )}
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
              {builtTile && (
                <div className="flex-col">
                  <div className="inline-block font-bold mb-1">Health:</div>
                  <div className="mx-2 inline-block">
                    {tileHealth ? (
                      <div>
                        {BigNumber.from(tileHealth?.value).toString()}/
                        {getBuildingMaxHealth(builtTile)}
                      </div>
                    ) : (
                      <div>
                        {getBuildingMaxHealth(builtTile)}/
                        {getBuildingMaxHealth(builtTile)}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div>
                <CraftRecipeDisplay />
              </div>
              <div className="flex-row mt-2 mb-2">
                {/* TODO: show owned resource for every resource possible */}
                {builtTile && (
                  <>
                    {(isClaimable(builtTile) ||
                      isClaimableFactory(builtTile)) &&
                      !isMainBase(builtTile) && (
                        <div className="font-bold mb-1">Storage:</div>
                      )}
                    {isClaimable(builtTile) &&
                      !isClaimableFactory(builtTile) && (
                        <ClaimButton
                          id="claim-button"
                          builtTile={builtTile}
                          coords={selectedTile}
                        />
                      )}
                    {isClaimableFactory(builtTile) && (
                      <ClaimCraftButton
                        id="claim-button-factory"
                        builtTile={builtTile}
                        coords={selectedTile}
                      />
                    )}
                    {transactionLoading ? (
                      <p>...</p>
                    ) : (
                      <AllResourceLabels entityIndex={tilesAtPosition[0]} />
                    )}
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
      <div className="z-[1000] viewport-container fixed bottom-4 right-4 h-14 w-64 flex flex-col bg-gray-700 text-white shadow-xl font-mono rounded">
        <div className="mt-4 ml-5 flex flex-col">
          <button
            id="minimize-button-tooltip-box"
            onClick={minimizeBox}
            className="viewport-container fixed right-9"
          >
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
