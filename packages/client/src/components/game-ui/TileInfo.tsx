import { useEffect, useRef, useState } from "react";
import { Perlin, createPerlin } from "@latticexyz/noise";
import {
  EntityID,
  EntityIndex,
  Has,
  HasValue,
  getComponentValue,
} from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { useEntityQuery } from "@latticexyz/react";
import { motion } from "framer-motion";
import { primodium } from "@game/api";
import { useMud } from "src/context/MudContext";
import { getTopLayerKeyPair } from "src/util/tile";
import {
  BackgroundImage,
  BlockIdToKey,
  DisplayKeyPair,
} from "src/util/constants";
import { getBuildingMaxHealth } from "src/util/health";
import { ImageButton } from "../shared/ImageButton";

export const TileInfo = () => {
  const network = useMud();
  const { components, singletonIndex } = network;
  const selectedTile = primodium.hooks.useSelectedTile(network);
  const [initialized, setInitialized] = useState(false);
  const [terrainPair, setTerrainPair] = useState<DisplayKeyPair | null>(null);
  const perlinRef = useRef(null as null | Perlin);

  const tilesAtPosition = useEntityQuery(
    [
      Has(components.Tile),
      HasValue(components.Position, {
        x: selectedTile?.x ?? 0,
        y: selectedTile?.y ?? 0,
      }),
    ],
    { updateOnValueChange: true }
  );

  useEffect(() => {
    createPerlin().then((perlin: Perlin) => {
      perlinRef.current = perlin;
      setInitialized(true);
    });
  }, []);

  useEffect(() => {
    if (!initialized) return;

    if (!perlinRef.current) return;

    if (!selectedTile) return;

    const perlin = perlinRef.current;
    const terrainPair = getTopLayerKeyPair(selectedTile, perlin);

    setTerrainPair(terrainPair);
  }, [initialized, selectedTile]);

  const entityIndex = tilesAtPosition[0] as EntityIndex | undefined;
  const tile = getComponentValue(components.Tile, entityIndex ?? singletonIndex)
    ?.value as unknown as EntityID | undefined;
  const health = getComponentValue(
    components.Health,
    entityIndex ?? singletonIndex
  )?.value as unknown as number | undefined;

  return (
    <div>
      {selectedTile && (
        <div className=" z-[1000] viewport-container fixed top-2 right-1/2 translate-x-1/2 text-white drop-shadow-xl font-mono select-none">
          <div
            style={{
              transform: "perspective(500px) rotateX(10deg)",
              filter: "drop-shadow(2px 2px 0 rgb(20 184 166 / 0.4))",
            }}
          >
            <motion.div
              className="flex flex-col items-center space-y-2"
              initial={{ opacity: 0, scale: 0, y: -200 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: -200 }}
            >
              <TileInfo.Coord coord={selectedTile} />
              {tile && (
                <TileInfo.BuildingTile
                  buildingTile={tile}
                  buildingHealth={health}
                />
              )}
              {terrainPair && !tile && (
                <TileInfo.TerrainTile terrainPair={terrainPair} />
              )}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

TileInfo.Coord = ({ coord }: { coord: Coord }) => {
  return (
    <p className="flex items-center whitespace-nowrap px-1 mb-2 bg-gray-900 border-2 border-cyan-600 crt">
      <b>{`(${coord.x}, ${coord.y})`}</b>
    </p>
  );
};

TileInfo.BuildingTile = ({
  buildingTile,
  buildingHealth,
}: {
  buildingTile: EntityID;
  buildingHealth?: number;
}) => {
  const percentHealth =
    (buildingHealth ?? getBuildingMaxHealth(buildingTile)) /
    getBuildingMaxHealth(buildingTile);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative border-4 border-t-yellow-400 border-x-yellow-500 border-b-yellow-600 ring-4 ring-slate-900/90 w-fit crt">
        <img
          src={BackgroundImage.get(buildingTile)}
          className="w-16 h-16 pixel-images"
        />
        <div className="absolute flex items-center bottom-0 left-1/2 -translate-x-1/2 w-20 h-2 ring-2 ring-slate-900/90 crt">
          <div
            className="h-full bg-green-500"
            style={{ width: `${percentHealth * 100}%` }}
          />
          <div
            className="h-full bg-gray-900"
            style={{ width: `${(1 - percentHealth) * 100}%` }}
          />
        </div>
        <p className="absolute flex items-center -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 border border-cyan-600 px-1 crt">
          <b>
            {BlockIdToKey[buildingTile]
              .replace(/([A-Z]+)/g, " $1")
              .replace(/([A-Z][a-z])/g, " $1")}
          </b>
        </p>
      </div>
      <div className="relative">
        <ImageButton
          className="w-36 h-12 text-green-100 border-2 border-cyan-600"
          image="/img/buttons/rectangle/blue/up.png"
          activeImage="/img/buttons/rectangle/blue/down.png"
        >
          <p className="-translate-y-[2px] active:translate-y-0 font-bold leading-none h-full flex justify-center items-center crt">
            Upgrade
          </p>
        </ImageButton>
      </div>
    </div>
  );
};

TileInfo.TerrainTile = ({ terrainPair }: { terrainPair: DisplayKeyPair }) => {
  return (
    <div className="relative border-4 border-t-yellow-400 border-x-yellow-500 border-b-yellow-600 ring-4 ring-gray-800 crt">
      <img
        src={BackgroundImage.get(terrainPair.terrain)}
        className="w-16 h-16 pixel-images"
      />
      {terrainPair.resource && (
        <img
          src={BackgroundImage.get(terrainPair.resource)}
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
  );
};
