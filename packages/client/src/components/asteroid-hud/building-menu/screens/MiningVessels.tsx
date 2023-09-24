import { Navigator } from "src/components/core/Navigator";
import { ResearchItem } from "../widgets/ResearchItem";
import {
  AegisDroneUpgradeTree,
  AnvilDroneUpgradeTree,
  HammerDroneUpgradeTree,
  MiningVesselUpgradeTree,
  StingerDroneUpgradeTree,
} from "src/util/research";

export const MiningVessels = () => {
  return (
    <Navigator.Screen title="MiningVessels" className="flex items-center">
      <div className="grid grid-cols-2 w-full mb-2 gap-1">
        <ResearchItem data={MiningVesselUpgradeTree} />
        <ResearchItem data={HammerDroneUpgradeTree} />
        <ResearchItem data={StingerDroneUpgradeTree} />
        <ResearchItem data={AegisDroneUpgradeTree} />
      </div>

      <Navigator.BackButton />
    </Navigator.Screen>
  );
};
