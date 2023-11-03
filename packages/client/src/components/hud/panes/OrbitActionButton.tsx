import { Entity } from "@latticexyz/recs";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { Button } from "src/components/core/Button";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { recallArrival } from "src/util/web3/contractCalls/recall";
import { reinforce } from "src/util/web3/contractCalls/reinforce";

export const OrbitActionButton: React.FC<{
  arrivalEntity: Entity;
  destination: Entity;
  outgoing: boolean;
}> = ({ arrivalEntity, destination, outgoing }) => {
  const network = useMud().network;

  const queueType = outgoing ? TransactionQueueType.Recall : TransactionQueueType.Reinforce;
  const { key } = decodeEntity(components.MapItemArrivals.metadata.keySchema, arrivalEntity);
  return (
    <TransactionQueueMask queueItemId={hashEntities(queueType, key, destination)}>
      <Button
        className={`btn-sm btn-seoncdary `}
        onClick={() => {
          if (outgoing) {
            recallArrival(destination, arrivalEntity, network);
            return;
          }

          reinforce(destination, arrivalEntity, network);
        }}
      >
        {!outgoing ? "ACCEPT" : "RECALL"}
      </Button>
    </TransactionQueueMask>
  );
};
