import L from "leaflet";
import React, { useEffect } from "react";
import { LayerGroup, LayersControl } from "react-leaflet";

// export raw internal layer object for singleton use in other components
export const _TourHintLayer = L.layerGroup();

//add layer to map, needs to be child of MapContainer
const TourHintLayer = () => {
  const ref = React.useRef<L.LayerGroup>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.addLayer(_TourHintLayer);
      ref.current.setZIndex(2000);
    }
  }, []);

  return (
    <LayersControl.Overlay checked={true} name="Tour Hints">
      <LayerGroup ref={ref} />;
    </LayersControl.Overlay>
  );
};

export default TourHintLayer;
