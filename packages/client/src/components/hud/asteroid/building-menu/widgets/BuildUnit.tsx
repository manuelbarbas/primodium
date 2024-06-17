import { UnitImages } from "@primodiumxyz/assets";
import { SecondaryCard } from "@/components/core/Card";
import { Navigator } from "@/components/core/Navigator";

export const BuildUnit: React.FC = () => {
  return (
    <SecondaryCard className="w-full flex-row items-center gap-2 justify-center">
      <Navigator.NavButton to="BuildQueue" className="btn-md w-fit btn-secondary flex gap-2 px-10">
        <img src={UnitImages.StingerDrone} className="w-8 h-8" />
        <p className="uppercase text-xs font-bold">train units</p>
      </Navigator.NavButton>
    </SecondaryCard>
  );
};
