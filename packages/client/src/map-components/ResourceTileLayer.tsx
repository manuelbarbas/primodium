import React, { useState, useEffect, useCallback } from "react";

import { Coord } from "@latticexyz/utils";

import { LayersControl, LayerGroup, useMap, useMapEvent } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";

import ResourceTile from "./ResourceTile";
import SelectedTile from "./SelectedTile";
import { useSelectedTile } from "../context/SelectedTileContext";
import SelectedPath from "./SelectedPath";
import { DisplayKeyPair, DisplayTile } from "../util/constants";
import { useGameStore } from "../store/GameStore";
import { BigNumber } from "ethers";
import { useTransactionLoading } from "../context/TransactionLoadingContext";
import { execute } from "../network/actions";
import { useMud } from "../context/MudContext";
import { EntityID } from "@latticexyz/recs";

const ResourceTileLayer = ({
  getTileKey,
}: {
  getTileKey: (coord: Coord) => DisplayKeyPair;
}) => {
  const map = useMap();
  const {
    // selectedTile,
    // setSelectedTile,
    selectedStartPathTile,
    selectedEndPathTile,
    showSelectedPathTiles,
    navigateToTile,
    setNavigateToTile,
  } = useSelectedTile();

  const { setTransactionLoading } = useTransactionLoading();
  const { systems, providers } = useMud();

  const [
    hoveredTile,
    setHoveredTile,
    selectedTile,
    setSelectedTile,
    selectedBlock,
    setSelectedBlock,
  ] = useGameStore((state) => [
    state.hoveredTile,
    state.setHoveredTile,
    state.selectedTile,
    state.setSelectedTile,
    state.selectedBlock,
    state.setSelectedBlock,
  ]);

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

  const buildTile = async (pos: DisplayTile, blockType: EntityID) => {
    setTransactionLoading(true);
    await execute(
      systems["system.Build"].executeTyped(BigNumber.from(blockType), pos, {
        gasLimit: 1_800_000,
      }),
      providers
    );
    setTransactionLoading(false);
  };

  // Select tile
  // Touch event listener on the map itself instead of each tile due to touch offset issues for zoom.
  const clickEvent = useCallback(
    (event: LeafletMouseEvent) => {
      const mousePos = {
        x: Math.floor(event.latlng.lng),
        y: Math.floor(event.latlng.lat),
      };

      //update selected tile position
      setSelectedTile(mousePos);

      //build tile if block selected from menu
      if (selectedBlock !== null) {
        console.log("Building block: " + selectedBlock);
        buildTile(mousePos, selectedBlock);
        setSelectedBlock(null);
      }
    },
    [map, selectedBlock]
  );

  const hoverEvent = useCallback(
    (event: LeafletMouseEvent) => {
      setHoveredTile({
        x: Math.floor(event.latlng.lng),
        y: Math.floor(event.latlng.lat),
      });
    },
    [map]
  );

  useMapEvent("click", clickEvent);
  useMapEvent("mousemove", hoverEvent);

  // Navigating to selected tile when navigateToTile is set to true
  useEffect(() => {
    if (navigateToTile) {
      map.flyTo([selectedTile.y, selectedTile.x]);
      setNavigateToTile(false);
    }
  }, [navigateToTile]);

  // Displaying tiles
  const [tiles, setTiles] = useState<JSX.Element[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<JSX.Element[]>([]);
  const [selectedPathTiles, setSelectedPathTiles] = useState<JSX.Element[]>([]);
  const [hoveredTiles, setHoveredTiles] = useState<JSX.Element[]>([]);

  useEffect(() => {
    if (!map) return;

    const tilesToRender: JSX.Element[] = [];
    const selectedTilesToRender: JSX.Element[] = [];
    const selectedPathTilesToRender: JSX.Element[] = [];
    const hoveredTilesToRender: JSX.Element[] = [];

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
            terrain={tileKey.terrain}
            resource={tileKey.resource}
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

    hoveredTilesToRender.push(
      <SelectedTile
        key={JSON.stringify({
          x: hoveredTile.x,
          y: hoveredTile.y,
          render: "hoveredTile",
        })}
        x={hoveredTile.x}
        y={hoveredTile.y}
        color="pink"
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
      <SelectedPath
        key="selectedPath"
        startCoord={selectedStartPathTile}
        endCoord={selectedEndPathTile}
      />
    );

    setTiles(tilesToRender);
    setSelectedTiles(selectedTilesToRender);
    setSelectedPathTiles(selectedPathTilesToRender);
    setHoveredTiles(hoveredTilesToRender);
  }, [
    displayTileRange,
    hoveredTile,
    selectedTile,
    selectedStartPathTile,
    selectedEndPathTile,
    hoveredTile,
  ]);

  return (
    <>
      <LayersControl.Overlay
        checked={showSelectedPathTiles}
        name="Selected Path"
      >
        <LayerGroup>{selectedPathTiles}</LayerGroup>
      </LayersControl.Overlay>
      <LayersControl.Overlay checked={true} name="Selected Tile">
        <LayerGroup>{selectedTiles}</LayerGroup>
      </LayersControl.Overlay>
      <LayersControl.Overlay
        checked={selectedBlock !== null}
        name="Hovered Tile"
      >
        <LayerGroup>{hoveredTiles}</LayerGroup>
      </LayersControl.Overlay>
      <LayersControl.Overlay checked={true} name="Resources">
        <LayerGroup>{tiles}</LayerGroup>
      </LayersControl.Overlay>
    </>
  );
};

export default React.memo(ResourceTileLayer);
