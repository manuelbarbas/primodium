import { Entity } from "@latticexyz/recs";
import { Navigator } from "src/components/core/Navigator";
import { BuildUnit } from "../widgets/BuildUnit";
import { Header } from "../widgets/Header";
import { Upgrade } from "../widgets/Upgrade";

export const UnitFactory: React.FC<{ building: Entity }> = ({ building }) => {
  return (
    <Navigator.Screen title={building} className="w-full gap-1">
      <Header building={building} />
      <Upgrade building={building} />
      <div className="grid grid-cols-2 w-full gap-1">
        <BuildUnit />
      </div>
    </Navigator.Screen>
  );
};
