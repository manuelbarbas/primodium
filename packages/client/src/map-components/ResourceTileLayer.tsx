import React, { useState, useEffect, useCallback } from "react";
import { LayersControl, LayerGroup, useMap, useMapEvent } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";

import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { BigNumber } from "ethers";

import { useMud } from "../context/MudContext";
import { useGameStore } from "../store/GameStore";
import { execute } from "../network/actions";
import { BlockType, DisplayKeyPair, DisplayTile } from "../util/constants";

import ResourceTile from "./ResourceTile";
import SelectedTile from "./SelectedTile";
import SelectedPath from "./SelectedPath";
import HoverTile from "./HoverTile";
import SelectedAttack from "./SelectedAttack";

const ResourceTileLayer = ({
  getTileKey,
}: {
  getTileKey: (coord: Coord) => DisplayKeyPair;
}) => {
  const map = useMap();

  const { systems, providers } = useMud();

  const [
    hoveredTile,
    setHoveredTile,
    selectedTile,
    setSelectedTile,
    selectedBlock,
    setSelectedBlock,
    navigateToTile,
    setNavigateToTile,
    showSelectedPathTiles,
    selectedPathTiles,
    showSelectedAttackTiles,
    selectedAttackTiles,
    setStartSelectedPathTile,
    setEndSelectedPathTile,
    setStartSelectedAttackTile,
    setEndSelectedAttackTile,
    setTransactionLoading,
    lockedAttackTarget,
    setLockedAttackTarget,
  ] = useGameStore((state) => [
    state.hoveredTile,
    state.setHoveredTile,
    state.selectedTile,
    state.setSelectedTile,
    state.selectedBlock,
    state.setSelectedBlock,
    state.navigateToTile,
    state.setNavigateToTile,
    state.showSelectedPathTiles,
    state.selectedPathTiles,
    state.showSelectedAttackTiles,
    state.selectedAttackTiles,
    state.setStartSelectedPathTile,
    state.setEndSelectedPathTile,
    state.setStartSelectedAttackTile,
    state.setEndSelectedAttackTile,
    state.setTransactionLoading,
    state.lockedAttackTarget,
    state.setLockedAttackTarget,
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

  const createPath = useCallback(
    async (start: DisplayTile, end: DisplayTile) => {
      if (selectedPathTiles.start !== null && selectedPathTiles.end !== null) {
        setTransactionLoading(true);
        await execute(
          systems["system.BuildPath"].executeTyped(start, end, {
            gasLimit: 500_000,
          }),
          providers
        );
        setTransactionLoading(false);
      }
    },
    [selectedPathTiles]
  );

  const destroyTile = async (pos: DisplayTile) => {
    setTransactionLoading(true);
    await execute(
      systems["system.Destroy"].executeTyped(pos, {
        gasLimit: 1_000_000,
      }),
      providers
    );
    setTransactionLoading(false);
  };

  const destroyPath = async (pos: DisplayTile) => {
    setTransactionLoading(true);
    await execute(
      systems["system.DestroyPath"].executeTyped(pos, {
        gasLimit: 500_000,
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

      switch (selectedBlock) {
        case null:
          setSelectedTile(mousePos);
          return;
        case BlockType.Conveyor:
          if (selectedPathTiles.start === null) {
            setStartSelectedPathTile(mousePos);
            return;
          }

          if (selectedPathTiles.end !== null) {
            //clear selected block since path is now building. Also insure the end path is where the player clicked.
            setEndSelectedPathTile(mousePos);
            setSelectedBlock(null);

            createPath(selectedPathTiles.start, selectedPathTiles.end);

            //clear path tiles
            setStartSelectedPathTile(null);
            setEndSelectedPathTile(null);
          }
          return;
        case BlockType.DemolishBuilding:
          setSelectedBlock(null);
          destroyTile(mousePos);
          return;
        case BlockType.DemolishPath:
          setSelectedBlock(null);
          destroyPath(mousePos);
          return;
        case BlockType.SelectAttack:
          if (selectedAttackTiles.start === null) {
            setSelectedTile(mousePos);
            setStartSelectedAttackTile(mousePos);
            setLockedAttackTarget(false);
          } else if (!lockedAttackTarget) {
            setEndSelectedAttackTile(mousePos);
            setLockedAttackTarget(true);
          }
          return;
        default:
          buildTile(mousePos, selectedBlock);
          setSelectedBlock(null);
          return;
      }
    },
    [map, selectedBlock, selectedPathTiles, selectedAttackTiles]
  );

  const hoverEvent = useCallback(
    (event: LeafletMouseEvent) => {
      const mousePos = {
        x: Math.floor(event.latlng.lng),
        y: Math.floor(event.latlng.lat),
      };

      if (selectedBlock === null) return;

      // if hover tile is the same as the current hovered tile, don't update
      if (mousePos.x === hoveredTile.x && mousePos.y === hoveredTile.y) return;

      // Selected path is set on hover, but selected attack path is set on click so users can select weapon.
      if (
        selectedPathTiles.start !== null &&
        selectedBlock === BlockType.Conveyor
      ) {
        setEndSelectedPathTile(mousePos);
        setHoveredTile(mousePos);
      } else if (
        selectedAttackTiles.start !== null &&
        selectedBlock === BlockType.SelectAttack
      ) {
        if (!lockedAttackTarget) {
          // don't set hovered tile if attack target is locked
          setEndSelectedAttackTile(mousePos);
          setHoveredTile(mousePos);
        }
      } else {
        setHoveredTile(mousePos);
      }
    },
    [
      map,
      selectedBlock,
      selectedPathTiles,
      selectedAttackTiles,
      hoveredTile,
      lockedAttackTarget,
    ]
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
  const [selectedPathTile, setSelectedPathTiles] = useState<JSX.Element[]>([]);
  const [selectedAttackTile, setSelectedAttackTiles] = useState<JSX.Element[]>(
    []
  );
  const [hoveredTiles, setHoveredTiles] = useState<JSX.Element[]>([]);

  // Render tiles
  useEffect(() => {
    if (!map) return;

    const tilesToRender: JSX.Element[] = [];

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

    setTiles(tilesToRender);
  }, [displayTileRange]);

  //Render select tiles
  useEffect(() => {
    if (!map) return;

    const selectedTilesToRender: JSX.Element[] = [];
    const selectedPathTilesToRender: JSX.Element[] = [];
    const selectedAttackTilesToRender: JSX.Element[] = [];

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

    // Path tiles

    if (selectedPathTiles.start)
      selectedPathTilesToRender.push(
        <SelectedTile
          key={JSON.stringify({
            x: selectedPathTiles.start.x,
            y: selectedPathTiles.start.y,
            render: "selectedStartPathTile",
          })}
          x={selectedPathTiles.start.x}
          y={selectedPathTiles.start.y}
          color="magenta"
          pane="markerPane"
        />
      );

    if (selectedPathTiles.end)
      selectedPathTilesToRender.push(
        <SelectedTile
          key={JSON.stringify({
            x: selectedPathTiles.end.x,
            y: selectedPathTiles.end.y,
            render: "selectedEndPathTile",
          })}
          x={selectedPathTiles.end.x}
          y={selectedPathTiles.end.y}
          color="magenta"
          pane="markerPane"
        />
      );

    if (selectedPathTiles.start && selectedPathTiles.end)
      selectedPathTilesToRender.push(
        <SelectedPath
          key="selectedPath"
          startCoord={selectedPathTiles.start}
          endCoord={selectedPathTiles.end}
        />
      );

    // Attack tiles

    if (selectedAttackTiles.start && selectedAttackTiles.end)
      selectedAttackTilesToRender.push(
        <SelectedAttack
          key="selectedAttackPath"
          startCoord={selectedAttackTiles.start}
          endCoord={selectedAttackTiles.end}
        />
      );

    setSelectedTiles(selectedTilesToRender);
    setSelectedPathTiles(selectedPathTilesToRender);
    setSelectedAttackTiles(selectedAttackTilesToRender);
  }, [selectedTile, selectedPathTiles, selectedAttackTiles]);

  //Render hover tiles
  useEffect(() => {
    if (!map) return;
    const hoveredTilesToRender: JSX.Element[] = [];

    hoveredTilesToRender.push(
      <HoverTile
        key={JSON.stringify({
          x: hoveredTile.x,
          y: hoveredTile.y,
          render: "hoveredTile",
        })}
        x={hoveredTile.x}
        y={hoveredTile.y}
        selectedBlock={selectedBlock}
      />
    );

    setHoveredTiles(hoveredTilesToRender);
  }, [hoveredTile, selectedBlock]);

  return (
    <>
      <LayersControl.Overlay
        checked={showSelectedPathTiles}
        name="Selected Path"
      >
        <LayerGroup>{selectedPathTile}</LayerGroup>
      </LayersControl.Overlay>
      <LayersControl.Overlay
        checked={showSelectedAttackTiles}
        name="Selected Attack Tiles"
      >
        <LayerGroup>{selectedAttackTile}</LayerGroup>
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
