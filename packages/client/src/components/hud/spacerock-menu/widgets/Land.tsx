import { Entity } from "@latticexyz/recs";
import { ERock, ESendType } from "contracts/config/enums";
import { Button } from "src/components/core/Button";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { invade } from "src/util/web3/contractCalls/invade";
import { raid } from "src/util/web3/contractCalls/raid";

export const Land: React.FC<{
  destination: Entity;
  rockType: ERock;
}> = ({ destination, rockType }) => {
  const network = useMud().network;
  const playerEntity = network.playerEntity;
  const destinationOwner = components.OwnedBy.use(destination)?.value;
  const orbiting = components.Arrival.get({
    from: playerEntity,
    onlyOrbiting: true,
    destination: destination,
  }).filter((elem) => elem?.sendType !== ESendType.Reinforce);

  const isNeutral = destinationOwner === playerEntity || !destinationOwner;

  if (!orbiting.length) return <></>;

  return (
    <div className="w-full flex justify-center mt-2">
      <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Land, destination)}>
        <Button
          className={`btn-sm w-44 ${isNeutral ? "btn-secondary" : "btn-error"} flex items-center `}
          onClick={() => {
            if (ERock.Motherlode === rockType) {
              invade(destination, network);
              return;
            }

            if (ERock.Asteroid === rockType) {
              raid(destination, network);
              return;
            }
          }}
        >
          {isNeutral && "LAND"}
          {!isNeutral && "ATTACK"}
        </Button>
      </TransactionQueueMask>
    </div>
  );
};
