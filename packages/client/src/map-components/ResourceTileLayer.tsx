import React, { useState, useEffect, useCallback } from "react";

import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";

import {
  LayersControl,
  LayerGroup,
  useMap,
  useMapEvent,
  Polyline,
} from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";

import ResourceTile from "./ResourceTile";
import SelectedTile from "./SelectedTile";
import { useSelectedTile } from "../context/SelectedTileContext";

const ResourceTileLayer = ({
  getTileKey,
}: {
  getTileKey: (coord: Coord) => EntityID;
}) => {
  const map = useMap();
  const {
    selectedTile,
    setSelectedTile,
    selectedStartPathTile,
    selectedEndPathTile,
  } = useSelectedTile();

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
  const [zoom, setZoom] = useState(map.getZoom());
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
  const [tiles, setTiles] = useState<JSX.Element[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<JSX.Element[]>([]);
  const [selectedPathTiles, setSelectedPathTiles] = useState<JSX.Element[]>([]);

  useEffect(() => {
    if (!map) return;

    let tilesToRender: JSX.Element[] = [];
    let selectedTilesToRender: JSX.Element[] = [];
    let selectedPathTilesToRender: JSX.Element[] = [];

    // Render tiles and paths that start and end at displayed tiles
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

    // Render selected tiles
    selectedTilesToRender.push(
      <SelectedTile
        key={JSON.stringify({
          x: selectedTile.x,
          y: selectedTile.y,
          render: "selectedTile",
        })}
        x={selectedTile.x}
        y={selectedTile.y}
        color="yellow"
      />
    );

    selectedPathTilesToRender.push(
      <SelectedTile
        key={JSON.stringify({
          x: selectedStartPathTile.x,
          y: selectedStartPathTile.y,
          render: "selectedStartPathTile",
        })}
        x={selectedStartPathTile.x}
        y={selectedStartPathTile.y}
        color="red"
        pane="markerPane"
      />
    );

    selectedPathTilesToRender.push(
      <SelectedTile
        key={JSON.stringify({
          x: selectedEndPathTile.x,
          y: selectedEndPathTile.y,
          render: "selectedEndPathTile",
        })}
        x={selectedEndPathTile.x}
        y={selectedEndPathTile.y}
        color="green"
        pane="markerPane"
      />
    );

    selectedPathTilesToRender.push(
      <Polyline
        key="path-in-progress-1"
        pathOptions={{
          color: "brown",
          dashArray: "10 30",
          weight: 10,
        }}
        positions={[
          [selectedStartPathTile.y + 0.5, selectedStartPathTile.x + 0.5],
          [selectedEndPathTile.y + 0.5, selectedStartPathTile.x + 0.5],
          [selectedEndPathTile.y + 0.5, selectedEndPathTile.x + 0.5],
        ]}
        pane="markerPane"
      />
    );

    setTiles(tilesToRender);
    setSelectedTiles(selectedTilesToRender);
    setSelectedPathTiles(selectedPathTilesToRender);
  }, [
    displayTileRange,
    selectedTile,
    selectedStartPathTile,
    selectedEndPathTile,
  ]);

  return (
    <>
      <LayersControl.Overlay checked={true} name="Selected Path">
        <LayerGroup>{selectedPathTiles}</LayerGroup>
      </LayersControl.Overlay>
      <LayersControl.Overlay checked={true} name="Selected Tile">
        <LayerGroup>{selectedTiles}</LayerGroup>
      </LayersControl.Overlay>
      <LayersControl.Overlay checked={true} name="Resources">
        <LayerGroup>{tiles}</LayerGroup>
      </LayersControl.Overlay>
    </>
  );
};

export default React.memo(ResourceTileLayer);
