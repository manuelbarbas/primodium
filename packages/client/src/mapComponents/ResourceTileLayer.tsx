import React, { useState, useEffect, useCallback } from "react";

import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";

import { LayersControl, LayerGroup, useMap, useMapEvent } from "react-leaflet";

import { DisplayTile } from "../util/constants";
import ResourceTile from "./ResourceTile";
import SelectedTile from "./SelectedTile";

const ResourceTileLayer = ({
  getTileKey,
  selectedTile,
  setSelectedTile,
}: {
  getTileKey: (coord: Coord) => EntityID;
  selectedTile: DisplayTile;
  setSelectedTile: React.Dispatch<React.SetStateAction<DisplayTile>>;
}) => {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  const [tileRange, setTileRange] = useState({
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
  });

  const setNewBounds = useCallback(() => {
    const bounds = map.getBounds();
    const newTileRange = {
      x1: Math.floor(bounds.getWest()),
      x2: Math.ceil(bounds.getEast()),
      y1: Math.floor(bounds.getSouth()),
      y2: Math.ceil(bounds.getNorth()),
    };
    setTileRange(newTileRange);
  }, [map]);
  useEffect(setNewBounds, [map]);
  useMapEvent("moveend", setNewBounds);

  const zoomChange = useCallback(() => {
    setZoom(map.getZoom());
  }, [map]);
  useMapEvent("zoom", zoomChange);

  let [tiles, setTiles] = useState<JSX.Element[]>([]);

  useEffect(() => {
    if (!map) return;

    let tilesToRender: JSX.Element[] = [];

    for (let i = tileRange.x1; i < tileRange.x2; i += 1) {
      for (let j = tileRange.y1; j < tileRange.y2; j += 1) {
        const tileKey = getTileKey({
          x: i,
          y: j,
        });
        tilesToRender.push(
          <ResourceTile
            x={i}
            y={j}
            tileKey={tileKey}
            setSelectedTile={setSelectedTile}
          />
        );

        if (selectedTile.x === i && selectedTile.y === j) {
          tilesToRender.push(<SelectedTile x={i} y={j} />);
        }
      }
    }

    setTiles(tilesToRender);
  }, [tileRange, selectedTile]);

  return (
    <>
      <LayersControl.Overlay checked={true} name="Resources">
        <LayerGroup>{tiles}</LayerGroup>
      </LayersControl.Overlay>
    </>
  );
};

export default React.memo(ResourceTileLayer);
