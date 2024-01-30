import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Marker } from "src/components/shared/Marker";
import { useMud } from "src/hooks";

export const HomeMarker = () => {
  const {
    components,
    playerAccount: { entity: playerEntity },
  } = useMud();
  const homeAsteroid = components.Home.use(playerEntity)?.value ?? singletonEntity;
  const position = components.Position.use(homeAsteroid as Entity) ?? { x: 0, y: 0 };

  return <Marker coord={position} imageUri="/img/icons/utilitiesicon.png" />;
};
