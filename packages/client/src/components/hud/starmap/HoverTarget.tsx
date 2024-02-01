import { Scenes } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { getFleetTilePosition } from "src/util/unit";
import { Marker } from "../../shared/Marker";

export const HoverSendTarget: React.FC<{ hoverEntity: Entity; sendUnit: Entity }> = ({ hoverEntity, sendUnit }) => {
  const isFleet = components.IsFleet.use(hoverEntity);

  const ownerRock = components.OwnedBy.use(sendUnit)?.value;
  const position = components.Position.use(hoverEntity) ?? { x: 0, y: 0 };
  if (isFleet) return <></>;
  if (components.BuildingType.has(hoverEntity)) return <></>;

  if (ownerRock == hoverEntity) return <Marker coord={position} imageUri="/img/icons/debugicon.png" />;
  return <Marker coord={position} imageUri="/img/icons/weaponryicon.png" />;
};

export const HoverAttackTarget: React.FC<{ hoverEntity: Entity; attackOrigin: Entity }> = ({
  hoverEntity,
  attackOrigin,
}) => {
  const isFleet = components.IsFleet.use(hoverEntity);
  const tilemap = usePrimodium().api(Scenes.Starmap).scene.getConfig(Scenes.Starmap)?.tilemap;
  const hoverTilePosition = isFleet
    ? getFleetTilePosition(hoverEntity, tilemap)
    : components.Position.use(hoverEntity) ?? { x: 0, y: 0 };

  const hoverRock = (isFleet ? components.FleetMovement.get(hoverEntity)?.destination : hoverEntity) as
    | Entity
    | undefined;
  const hoverOwnerRock = (isFleet ? components.OwnedBy.get(hoverEntity)?.value : hoverEntity) as Entity | undefined;
  const hoverRockOwner = components.OwnedBy.use(hoverRock)?.value;

  const attackOriginRock = components.FleetMovement.use(attackOrigin)?.destination as Entity | undefined;
  const attackOriginOwnerRock = components.OwnedBy.get(attackOrigin)?.value as Entity;
  const attackOriginOwnerRockOwner = components.OwnedBy.use(attackOriginOwnerRock)?.value;
  if (!hoverTilePosition || !attackOriginOwnerRockOwner || !hoverOwnerRock) return <></>;

  if (hoverRock !== attackOriginRock || hoverRockOwner === attackOriginOwnerRockOwner)
    return <Marker coord={hoverTilePosition} imageUri="/img/icons/debugicon.png" />;
  if (hoverRock !== attackOriginRock) return <Marker coord={hoverTilePosition} imageUri="/img/icons/debugicon.png" />;
  return <Marker coord={hoverTilePosition} imageUri="/img/icons/weaponryicon.png" />;
};

export const HoverTarget = () => {
  const mapOpen = components.MapOpen.use()?.value ?? false;
  const hoverEntity = components.HoverEntity.use()?.value;
  const sendOrigin = components.Send.use()?.originFleet;
  const attackOrigin = components.Attack.use()?.originFleet;
  if (!mapOpen || !hoverEntity) return <></>;
  if (sendOrigin) return <HoverSendTarget hoverEntity={hoverEntity} sendUnit={sendOrigin} />;
  if (attackOrigin) return <HoverAttackTarget hoverEntity={hoverEntity} attackOrigin={attackOrigin} />;
  return <></>;
};
