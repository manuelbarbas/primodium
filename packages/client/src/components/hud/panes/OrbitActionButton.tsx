import { Entity } from "@latticexyz/recs";
import { ESendType } from "contracts/config/enums";
import { Button } from "src/components/core/Button";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { invade } from "src/util/web3/contractCalls/invade";
import { raid } from "src/util/web3/contractCalls/raid";
import { recall } from "src/util/web3/contractCalls/recall";
import { reinforce } from "src/util/web3/contractCalls/reinforce";

export const OrbitActionButton: React.FC<{
  arrivalEntity: Entity;
  destination: Entity;
  sendType: ESendType;
  outgoing: boolean;
}> = ({ arrivalEntity, destination, sendType, outgoing }) => {
  const network = useMud().network;
  const destinationOwner = components.OwnedBy.use(destination)?.value;
  const playerEntity = network.playerEntity;

  const isNeutral = destinationOwner === playerEntity || !destinationOwner;
  return (
    <Button
      // loading={transactionLoading}
      className={`btn-sm ${isNeutral || sendType === ESendType.Reinforce ? "btn-secondary" : "btn-error"} `}
      onClick={() => {
        switch (sendType) {
          case ESendType.Invade:
            invade(destination, network);
            return;
          case ESendType.Raid:
            raid(destination, network);
            return;
          case ESendType.Reinforce:
            if (!isNeutral || outgoing) {
              recall(destination, arrivalEntity, network);
              return;
            }

            reinforce(destination, arrivalEntity, network);
        }
      }}
    >
      {isNeutral && (sendType === ESendType.Reinforce ? (!outgoing ? "ACCEPT" : "RECALL") : "LAND")}
      {!isNeutral && (sendType === ESendType.Reinforce ? "RECALL" : "ATTACK")}
    </Button>
  );
};
