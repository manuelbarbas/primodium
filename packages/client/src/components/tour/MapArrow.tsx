import ReactDOMServer from "react-dom/server";
import { useRef } from "react";

import L from "leaflet";

import Arrow from "./Arrow";
import { _TourHintLayer } from "../../map-components/TourHintLayer";

const MapArrow = ({
  x,
  y,
  highlight = false,
}: {
  x: number;
  y: number;
  highlight?: boolean;
}) => {
  const markerRef = useRef<L.Marker | null>(null);
  const highlightRef = useRef<L.Rectangle | null>(null);

  //use ref to prevent multiple markers from being created
  if (!markerRef.current) {
    //TODO: fix magic numbers to make arrow point to center of tile
    markerRef.current = L.marker([y + 1, x + 0.5], {
      icon: L.divIcon({
        className: "transparent",
        html: ReactDOMServer.renderToString(
          <Arrow
            direction="down"
            bounce
            className="-translate-y-full -translate-x-full"
          />
        ),
      }),
      pane: "markerPane",
    }).addTo(_TourHintLayer);
  } else {
    //TODO: fix magic numbers to make arrow point to center of tile
    markerRef.current.setLatLng([y + 1, x + 0.5]);
  }

  if (!highlight) return null;

  if (!highlightRef.current) {
    highlightRef.current = L.rectangle(
      [
        [y, x],
        [y + 1, x + 1],
      ],
      {
        color: "#fde047",
        weight: 4,
        fill: false,
        dashArray: "5, 5",
        pane: "markerPane",
      }
    ).addTo(_TourHintLayer);
  } else {
    highlightRef.current.setBounds([
      [y, x],
      [y + 1, x + 1],
    ]);
  }

  return null;
};

export default MapArrow;
