import { Perlin, createPerlin } from "@latticexyz/noise";
import { getTilesOfTypeInRange } from "../../util/tile";
import MapArrow from "./MapArrow";
import { useEffect, useRef, useState } from "react";
import { Coord } from "@latticexyz/utils";
import { EntityID } from "@latticexyz/recs";

const MapResourceHints = ({
  origin,
  range,
  blockType,
}: {
  origin: Coord;
  range: number;
  blockType: EntityID;
}) => {
  const [initialized, setInitialized] = useState(false);
  const perlinRef = useRef(null as null | Perlin);
  let tiles = [];

  useEffect(() => {
    createPerlin().then((perlin: Perlin) => {
      perlinRef.current = perlin;
      setInitialized(true);
    });
  }, []);

  if (!initialized || perlinRef.current === null) {
    return <></>;
  }

  if (perlinRef.current !== null && tiles.length === 0) {
    const perlin = perlinRef.current;
    tiles = getTilesOfTypeInRange(origin, blockType, range, perlin);
  } else {
    return <></>;
  }

  return (
    <>
      {tiles.map((tile) => {
        return (
          <MapArrow
            x={tile.x}
            y={tile.y}
            highlight
            key={`map-hint, origin: ${tile.x}-${tile.y} resource: ${blockType}`}
          />
        );
      })}
    </>
  );
};

export default MapResourceHints;
