import { Entity } from "@latticexyz/recs";
import { Navigator } from "src/components/core/Navigator";
import { components } from "src/network/components";
import { ExpandRange } from "../widgets/ExpandRange";
import { Header } from "../widgets/Header";
import { SpecialTech } from "../widgets/SpecialTech";
import { Upgrade } from "../widgets/Upgrade";

export const MainBase: React.FC<{ building: Entity }> = ({ building }) => {
  const asteroid = components.OwnedBy.use(building)?.value;
  return (
    <Navigator.Screen title={building} className="w-fit gap-1">
      <Header building={building} />
      <Upgrade building={building} />
      {asteroid && <ExpandRange asteroid={asteroid as Entity} />}
      <div className="grid grid-cols-2 w-full gap-1">
        <SpecialTech />
      </div>
    </Navigator.Screen>
  );
};
