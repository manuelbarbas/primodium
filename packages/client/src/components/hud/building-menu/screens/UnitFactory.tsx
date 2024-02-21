import { Entity } from "@latticexyz/recs";
import { Navigator } from "src/components/core/Navigator";
import { BuildUnit } from "../widgets/BuildUnit";
import { BuildingInfo } from "../widgets/BuildingInfo";
import { Upgrade } from "../widgets/Upgrade";

export const UnitFactory: React.FC<{ building: Entity }> = ({ building }) => {
  return (
    <Navigator.Screen title={building} className="w-full gap-1">
      <BuildingInfo />
      <Upgrade building={building} />
      <div className="grid grid-cols-2 w-full gap-1">
        <BuildUnit />
      </div>
    </Navigator.Screen>
  );
};
