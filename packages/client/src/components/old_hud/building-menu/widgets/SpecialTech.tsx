import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";

export const SpecialTech: React.FC = () => {
  return (
    <SecondaryCard className="w-full flex-row items-center gap-2 opacity-20">
      <img src="/img/icons/specialicon.png" className="w-8 h-8" />
      <p className="uppercase text-xs font-bold">unlock special tech</p>
      <Navigator.NavButton to="Special" className="btn-sm w-fit btn-secondary," disabled>
        Go
      </Navigator.NavButton>
    </SecondaryCard>
  );
};
