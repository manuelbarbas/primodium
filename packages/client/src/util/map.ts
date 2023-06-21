import { Coord } from "@latticexyz/utils";
import { _TourHintLayer } from "../map-components/TourHintLayer";
import L from "leaflet";

export const validMapClick = (pos: Coord) => {
  const hintCoords: Coord[] = [];

  //get coords of hint markers
  _TourHintLayer.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      const latLng = layer.getLatLng();
      hintCoords.push({
        x: Math.floor(latLng.lng - 0.5),
        y: Math.floor(latLng.lat - 1),
      });
    }
  });

  //if no hint markers, its a valid click
  if (hintCoords.length === 0) return true;

  //check if any coords in hintCoords match selectedTile
  const valid = hintCoords.some((coord) => {
    return coord.x === pos.x && coord.y === pos.y;
  });

  return valid;
};
