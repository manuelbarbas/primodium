import React, { useState, useEffect, useCallback } from "react";
import ReactDOMServer from "react-dom/server";

import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";

import {
  LayersControl,
  LayerGroup,
  Rectangle,
  Marker,
  useMap,
  useMapEvent,
} from "react-leaflet";
import L from "leaflet";

import { BlockColors } from "../util/constants";

const TILE_SIZE: number = 16;
const SCALE_FACTOR: number = 16;

const ResourceTileLayer = ({
  getTopLayerKeyHelper,
}: {
  getTopLayerKeyHelper: (coord: Coord) => EntityID;
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
  let [tileNames, setTileNames] = useState<JSX.Element[]>([]);

  useEffect(() => {
    if (!map) return;

    let tilesToRender: JSX.Element[] = [];
    let tileNamesToRender: JSX.Element[] = [];

    for (let i = tileRange.x1; i < tileRange.x2; i += 1) {
      for (let j = tileRange.y1; j < tileRange.y2; j += 1) {
        const currentCoord = { x: i, y: j };
        const topLayerKey = getTopLayerKeyHelper({
          x: i,
          y: j,
        });

        // Tile
        tilesToRender.push(
          <Rectangle
            key={JSON.stringify(currentCoord)}
            bounds={[
              [currentCoord.y, currentCoord.x],
              [
                currentCoord.y + TILE_SIZE / SCALE_FACTOR,
                currentCoord.x + TILE_SIZE / SCALE_FACTOR,
              ],
            ]}
            pathOptions={{
              fillOpacity: 1,
              weight: 1,
              color: BlockColors.get(topLayerKey as EntityID),
            }}
          />
        );

        // // Tile Names: commented out because too slow
        // const DivElement = (
        //   <div id={`${currentCoord.x},${currentCoord.y}`}>
        //     <p>icon</p>
        //   </div>
        // );

        // const divSize = 200;
        // let icon = new L.DivIcon({
        //   iconSize: [divSize, divSize],
        //   iconAnchor: [divSize / 2, divSize / 2],
        //   html: ReactDOMServer.renderToString(DivElement),
        // });

        // tileNamesToRender.push(
        //   <Marker
        //     key={JSON.stringify(currentCoord)}
        //     position={[
        //       currentCoord.y + TILE_SIZE / SCALE_FACTOR / 2,
        //       currentCoord.x + TILE_SIZE / SCALE_FACTOR / 2,
        //     ]}
        //   />
        // );
      }
    }

    setTiles(tilesToRender);
    setTileNames(tileNamesToRender);
  }, [tileRange]);

  return (
    <>
      <LayersControl.Overlay checked={true} name="Resources">
        <LayerGroup>{tiles}</LayerGroup>
      </LayersControl.Overlay>
      {/* <LayersControl.Overlay checked={zoom >= 6} name="Names">
        <LayerGroup>{tileNames}</LayerGroup>
      </LayersControl.Overlay> */}
    </>
  );
};

export default React.memo(ResourceTileLayer);
