import React, { useState, useEffect, useCallback } from "react";

import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";

import { LayersControl, LayerGroup, useMap, useMapEvent } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";

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

  const [displayTileRange, setDisplayTileRange] = useState({
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
  });

  // Map events
  const setNewBounds = useCallback(() => {
    const bounds = map.getBounds();
    const newDisplayTileRange = {
      x1: Math.floor(bounds.getWest()),
      x2: Math.ceil(bounds.getEast()),
      y1: Math.floor(bounds.getSouth()),
      y2: Math.ceil(bounds.getNorth()),
    };
    setDisplayTileRange(newDisplayTileRange);
  }, [map]);
  useEffect(setNewBounds, [map]);
  useMapEvent("moveend", setNewBounds);

  // Zoom event listener
  const zoomChange = useCallback(() => {
    setZoom(map.getZoom());
  }, [map]);
  useMapEvent("zoom", zoomChange);

  // Select tile
  // Touch event listener on the map itself instead of each tile due to touch offset issues for zoom.
  const clickEvent = useCallback(
    (event: LeafletMouseEvent) => {
      setSelectedTile({
        x: Math.floor(event.latlng.lng),
        y: Math.floor(event.latlng.lat),
      });
    },
    [map]
  );
  useMapEvent("click", clickEvent);

  // Displaying tiles
  let [tiles, setTiles] = useState<JSX.Element[]>([]);

  useEffect(() => {
    if (!map) return;

    let tilesToRender: JSX.Element[] = [];

    for (let i = displayTileRange.x1; i < displayTileRange.x2; i += 1) {
      for (let j = displayTileRange.y1; j < displayTileRange.y2; j += 1) {
        const tileKey = getTileKey({
          x: i,
          y: j,
        });
        tilesToRender.push(
          <ResourceTile
            key={JSON.stringify({ x: i, y: j, render: "tilesToRender" })}
            x={i}
            y={j}
            tileKey={tileKey}
          />
        );
      }
    }

    if (selectedTile.x !== null && selectedTile.y !== null) {
      tilesToRender.push(
        <SelectedTile
          key={JSON.stringify({
            x: selectedTile.x,
            y: selectedTile.x,
            render: "selectedTile",
          })}
          x={selectedTile.x}
          y={selectedTile.y}
        />
      );
    }

    setTiles(tilesToRender);
  }, [displayTileRange, selectedTile]);

  return (
    <>
      <LayersControl.Overlay checked={true} name="Resources">
        <LayerGroup>{tiles}</LayerGroup>
      </LayersControl.Overlay>
    </>
  );
};

export default React.memo(ResourceTileLayer);
