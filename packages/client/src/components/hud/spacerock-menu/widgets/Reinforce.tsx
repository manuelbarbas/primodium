import { FaArrowRight } from "react-icons/fa";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { Send } from "src/network/components/clientComponents";
import { ESendType, ESpaceRockType } from "src/util/web3/types";

export const Reinforce: React.FC<{ type: ESpaceRockType }> = ({ type }) => {
  return (
    <SecondaryCard className="w-full flex-row items-center gap-2 justify-between">
      <img src="/img/icons/reinforcementicon.png" className="w-8 h-8" />
      <p className="uppercase text-xs font-bold">
        reinforce {type === ESpaceRockType.Asteroid ? "asteroid" : "motherlode"}
        .
      </p>
      <Navigator.NavButton
        to="Send"
        className="btn-sm w-fit btn-success"
        onClick={() => Send.update({ sendType: ESendType.REINFORCE })}
      >
        <FaArrowRight />
      </Navigator.NavButton>
    </SecondaryCard>
  );
};
