import { useState } from "react";
import InfoBox from "../components/InfoBox";
import BuildingBox from "../components/BuildingBox";
import ResourceBox from "../components/ResourceBox";
import TooltipBox from "../components/TooltipBox";

import { MapContainer, TileLayer } from "react-leaflet";

export default function Home() {
  return (
    <>
      <div className="leaflet-container">
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          scrollWheelZoom={true}
          attributionControl={false}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </MapContainer>
      </div>
      <InfoBox />
      <ResourceBox />
      <BuildingBox />
      <TooltipBox />
    </>
  );
}
