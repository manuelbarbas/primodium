import { useMemo } from "react";
import { Widget } from "@/components/core/Widget";
import { useGame } from "@/hooks/useGame";
// import { components } from "@/network/components";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { entityToFleetName, entityToRockName } from "@/util/name";
// import { Mode } from "@/util/constants";
import { BattleMenu } from "@/components/hud/command/battle-menu/BattleMenu";
import { components } from "@/network/components";

export const BattleMenuPopup = () => {
  const game = useGame();
  const battleTarget = components.BattleTarget.use()?.value;

  const [coord, name, icon] = useMemo(() => {
    if (!battleTarget) return [{ x: 0, y: 0 }, "", InterfaceIcons.Asteroid];
    const isFleet = components.IsFleet.get(battleTarget)?.value;
    const name = isFleet ? entityToFleetName(battleTarget) : entityToRockName(battleTarget);
    const icon = isFleet ? InterfaceIcons.Fleet : InterfaceIcons.Asteroid;

    const obj = isFleet
      ? game.COMMAND_CENTER.objects.fleet.get(battleTarget)
      : game.COMMAND_CENTER.objects.asteroid.get(battleTarget);

    if (!obj) return [{ x: 0, y: 0 }, name, icon];

    return [obj.getPixelCoord(), name, icon];
  }, [battleTarget, game]);

  if (!battleTarget) return null;

  return (
    <Widget
      title={name}
      id="fleet-target"
      scene={"COMMAND_CENTER"}
      defaultCoord={{
        x: coord.x + 15 * (coord.x < 0 ? -1 : 1),
        y: Math.min(16, coord.y),
      }}
      defaultPinned
      draggable
      defaultVisible
      origin={coord.x < 0 ? "center-right" : "center-left"}
      minOpacity={1}
      topBar
      popUp
      noBorder
      icon={icon}
    >
      <BattleMenu target={battleTarget} />
    </Widget>
  );
};
