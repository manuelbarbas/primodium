import { SingletonID } from "@latticexyz/network";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { Account } from "src/network/components/clientComponents";
import { getResearchInfo, MiningResearchTree } from "src/util/research";

export const MiningVessels: React.FC = () => {
  const player = Account.get()?.value ?? SingletonID;
  const researchInfo = getResearchInfo(MiningResearchTree, player);

  console.log(researchInfo);

  return (
    <SecondaryCard className="w-full flex-row items-center gap-2">
      <img src="/img/unit/miningvessel.png" className="w-8 h-8" />
      <p className="uppercase text-xs font-bold">manage mining vessels</p>
      <Navigator.NavButton
        to="Commission"
        className="btn-sm w-fit btn-secondary"
      >
        Go
      </Navigator.NavButton>
    </SecondaryCard>
  );
};
