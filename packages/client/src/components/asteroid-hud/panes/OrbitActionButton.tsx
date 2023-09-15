import { SingletonID } from "@latticexyz/network";
import { EntityID } from "@latticexyz/recs";
import { useMud } from "src/hooks";
import { OwnedBy } from "src/network/components/chainComponents";
import { Account } from "src/network/components/clientComponents";
import { useGameStore } from "src/store/GameStore";
import { getIndex } from "src/util/arrival";
import { invade, raid, recall, reinforce } from "src/util/web3";
import { ESendType } from "src/util/web3/types";

export const OrbitActionButton: React.FC<{
  entity: EntityID;
  destination: EntityID;
  sendType: ESendType;
  outgoing: boolean;
}> = ({ entity, destination, sendType, outgoing }) => {
  const network = useMud();
  const destinationOwner = OwnedBy.use(destination)?.value;
  const player = Account.use()?.value ?? SingletonID;
  const transactionLoading = useGameStore((state) => state.transactionLoading);

  const isNeutral = destinationOwner === player || !destinationOwner;

  const index = getIndex(entity);
  return (
    <button
      disabled={transactionLoading || index === undefined}
      className={`border p-1 rounded-md hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        isNeutral || sendType === ESendType.REINFORCE
          ? "bg-cyan-700 border-cyan-500"
          : "bg-rose-800 border-rose-600"
      } ${transactionLoading ? "opacity-50 pointer-events-none" : ""} `}
      onClick={() => {
        switch (sendType) {
          case ESendType.INVADE:
            invade(destination, network);
            return;
          case ESendType.RAID:
            raid(destination, network);
            return;
          case ESendType.REINFORCE:
            if (!isNeutral || outgoing) {
              recall(destination, network);
              return;
            }

            if (index == undefined) return;
            reinforce(destination, index, network);
        }
      }}
    >
      {isNeutral &&
        (sendType === ESendType.REINFORCE
          ? !outgoing
            ? "ACCEPT"
            : "RECALL"
          : "LAND")}
      {!isNeutral && (sendType === ESendType.REINFORCE ? "RECALL" : "ATTACK")}
    </button>
  );
};
