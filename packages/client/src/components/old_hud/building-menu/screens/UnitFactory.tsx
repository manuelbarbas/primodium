import { EntityID } from "@latticexyz/recs";
import { Navigator } from "src/components/core/Navigator";
import { Header } from "../widgets/Header";
import { Upgrade } from "../widgets/Upgrade";
import { BuildUnit } from "../widgets/BuildUnit";
import { UpgradeUnit } from "../widgets/UpgradeUnit";

export const UnitFactory: React.FC<{ building: EntityID }> = ({ building }) => {
  return (
    <Navigator.Screen title={building} className="w-full">
      <Header building={building} />
      <Upgrade building={building} />
      <div className="grid grid-cols-2 w-full">
        <BuildUnit />
        <UpgradeUnit />
      </div>
    </Navigator.Screen>
  );
};
