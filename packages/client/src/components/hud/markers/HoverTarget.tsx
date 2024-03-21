import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { Marker } from "src/components/core/Marker";
import { starmapSceneConfig } from "src/game/lib/config/starmapScene";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { getCanAttack, getCanSend, getFleetTilePosition } from "src/util/unit";

export const HoverSendTarget: React.FC<{ hoverEntity: Entity; sendUnit: Entity }> = ({ hoverEntity, sendUnit }) => {
  const canSend = getCanSend(sendUnit, hoverEntity);
  const isFleet = components.IsFleet.use(hoverEntity) !== undefined;
  const position = components.Position.use(hoverEntity) ?? { x: 0, y: 0 };
  const coord = useMemo(() => {
    const { tileWidth, tileHeight } = starmapSceneConfig.tilemap;
    const pixelCoord = tileCoordToPixelCoord(position ?? { x: 0, y: 0 }, tileWidth, tileHeight);

    return { x: pixelCoord.x, y: -pixelCoord.y };
  }, [position]);

  if (isFleet) return null;

  return (
    <Marker coord={coord} id="hoverSend" scene={"STARMAP"}>
      <img src={canSend ? "/img/icons/crosshairsicon.png" : "/img/icons/notallowedicon.png"} />
    </Marker>
  );
};

export const HoverAttackTarget: React.FC<{ hoverEntity: Entity; attackOrigin: Entity }> = ({
  hoverEntity,
  attackOrigin,
}) => {
  const isFleet = components.IsFleet.use(hoverEntity) !== undefined;
  const primodium = usePrimodium().api("STARMAP");
  const scene = primodium.scene.getScene("STARMAP");
  const position = useMemo(
    () =>
      !scene
        ? null
        : isFleet
        ? getFleetTilePosition(scene, hoverEntity)
        : components.Position.get(hoverEntity) ?? { x: 0, y: 0 },
    [hoverEntity, isFleet, scene]
  );

  const coord = useMemo(() => {
    const { tileWidth, tileHeight } = starmapSceneConfig.tilemap;
    const pixelCoord = tileCoordToPixelCoord(position ?? { x: 0, y: 0 }, tileWidth, tileHeight);

    return { x: pixelCoord.x, y: -pixelCoord.y };
  }, [position]);

  if (!scene || hoverEntity === attackOrigin) return;
  const canAttack = getCanAttack(attackOrigin, hoverEntity);

  return (
    <Marker coord={coord} id={"hoverAttack"} scene={"STARMAP"}>
      <img src={canAttack ? "/img/icons/crosshairsicon.png" : "/img/icons/notallowedicon.png"} />
    </Marker>
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
