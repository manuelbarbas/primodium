import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Marker } from "src/components/shared/Marker";
import { components } from "src/network/components";

export const ActiveMarker = () => {
  const homeAsteroid = components.ActiveRock.use()?.value ?? singletonEntity;
  const position = components.Position.use(homeAsteroid as Entity) ?? { x: 0, y: 0 };

  return <Marker coord={position} imageUri="/img/icons/minersicon.png" />;
};
