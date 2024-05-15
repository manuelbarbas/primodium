import { Upgrade } from "@/components/hud/asteroid/building-menu/widgets/Upgrade";
import { EntityType } from "@/util/constants";
import { EntityToUnitImage } from "@/util/mappings";
import { Entity } from "@latticexyz/recs";
import { Navigator } from "src/components/core/Navigator";

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
