import { EntityType } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { Navigator } from "@/components/core/Navigator";
import { Upgrade } from "@/components/hud/asteroid/building-menu/widgets/Upgrade";
import { EntityToUnitImage } from "@/util/image";

export const Shipyard: React.FC<{ building: Entity }> = ({ building }) => {
  return (
    <Navigator.Screen title={building} className="gap-2">
      <Upgrade building={building} />
      <Navigator.NavButton to="Commission" variant="primary" size="md">
        <img src={EntityToUnitImage[EntityType.ColonyShip] ?? ""} className={`pixel-image text-lg w-[1em] scale-150`} />
        <span className="w-fit px-2 text-xs">Commission Colony Ships</span>
      </Navigator.NavButton>
    </Navigator.Screen>
  );
};
