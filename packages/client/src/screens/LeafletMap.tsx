import { useState, useCallback, useEffect, useRef } from "react";

import { createPerlin, Perlin } from "@latticexyz/noise";
import { SingletonID } from "@latticexyz/network";
import { Coord } from "@latticexyz/utils";

import { MapContainer, LayersControl } from "react-leaflet";
import L from "leaflet";

import { getTopLayerKeyPair } from "../util/tile";

import ResourceTileLayer from "../map-components/ResourceTileLayer";
import { Tour } from "../components/tour/Tour";
import TourHintLayer from "../map-components/TourHintLayer";
import { useTourStore } from "../store/TourStore";
import { useComponentValue } from "@latticexyz/react";
import { EntityID } from "@latticexyz/recs";
import { useAccount } from "../hooks/useAccount";
import { useMud } from "../context/MudContext";

export default function LeafletMap() {
  const { world, components, singletonIndex } = useMud();
  const { address } = useAccount();

  const [initialized, setInitialized] = useState(false);
  const [completedTutorial, checkpoint] = useTourStore((state) => [
    state.completedTutorial,
    state.checkpoint,
  ]);
  const perlinRef = useRef(null as null | Perlin);

  // resourceKey of the entity
  const resourceKey = address
    ? world.entityToIndex.get(address.toString().toLowerCase() as EntityID)!
    : singletonIndex;

  // fetch the main base of the user based on address
  const mainBaseCoord = useComponentValue(
    components.MainBaseInitialized,
    resourceKey
  );

  useEffect(() => {
    createPerlin().then((perlin: Perlin) => {
      perlinRef.current = perlin;
      setInitialized(true);
    });
  }, []);

  const getTopLayerKeyPairHelper = useCallback(
    (coord: Coord) => {
      const defaultPair = { terrain: SingletonID, resource: SingletonID };
      if (!initialized || perlinRef.current === null) {
        return defaultPair;
      }
      if (perlinRef.current !== null) {
        const perlin = perlinRef.current;
        return getTopLayerKeyPair(coord, perlin);
      } else {
        return defaultPair;
      }
    },
    [initialized]
  );

  if (!initialized) {
    return <p>Initializing...</p>;
  }

  //check if player has mainbase and checkpoint is null
  const playerInitialized = mainBaseCoord && checkpoint === null;

  return (
    <MapContainer
      center={[0, 0]}
      minZoom={5}
      maxZoom={8}
      zoom={6}
      scrollWheelZoom={true}
      attributionControl={false}
      zoomControl={false}
      preferCanvas={true}
      crs={L.CRS.Simple}
      className="map-container"
    >
      {!playerInitialized && !completedTutorial && <Tour />}
      <LayersControl position="bottomright">
        <ResourceTileLayer getTileKey={getTopLayerKeyPairHelper} />
        <TourHintLayer />
      </LayersControl>
    </MapContainer>
  );
}
