import { Scenes } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { getCanAttack, getCanSend, getFleetTilePosition } from "src/util/unit";
import { Marker } from "../../shared/Marker";

export const HoverSendTarget: React.FC<{ hoverEntity: Entity; sendUnit: Entity }> = ({ hoverEntity, sendUnit }) => {
  const canSend = getCanSend(sendUnit, hoverEntity);
  const isFleet = components.IsFleet.use(hoverEntity) !== undefined;
  const position = components.Position.use(hoverEntity) ?? { x: 0, y: 0 };
  if (isFleet) return null;

  return (
    <Marker coord={position} imageUri={canSend ? "/img/icons/crosshairsicon.png" : "/img/icons/notallowedicon.png"} />
  );
};

export const HoverAttackTarget: React.FC<{ hoverEntity: Entity; attackOrigin: Entity }> = ({
  hoverEntity,
  attackOrigin,
}) => {
  const isFleet = components.IsFleet.use(hoverEntity) !== undefined;
  const primodium = usePrimodium().api(Scenes.Starmap);
  const scene = primodium.scene.getScene(Scenes.Starmap);
  if (!scene || hoverEntity === attackOrigin) return;
  const position = isFleet
    ? getFleetTilePosition(scene, hoverEntity)
    : components.Position.get(hoverEntity) ?? { x: 0, y: 0 };
  const canAttack = getCanAttack(attackOrigin, hoverEntity);

  return (
    <Marker coord={position} imageUri={canAttack ? "/img/icons/crosshairsicon.png" : "/img/icons/notallowedicon.png"} />
  );
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
