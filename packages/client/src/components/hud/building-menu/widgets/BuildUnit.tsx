import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";

export const BuildUnit: React.FC = () => {
  return (
    <SecondaryCard className="w-full flex-row items-center gap-2 justify-center">
      <Navigator.NavButton to="BuildQueue" className="btn-md w-fit btn-secondary flex gap-2 px-10">
        <img src="/img/unit/aegisdrone.png" className="w-8 h-8" />
        <p className="uppercase text-xs font-bold">train units</p>
      </Navigator.NavButton>
    </SecondaryCard>
  );
};
