import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useLocation, useNavigate } from "react-router-dom";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { usePersistentStore } from "src/game/stores/PersistentStore";
import { useMud } from "src/hooks/useMud";
import { components } from "src/network/components";
import { spawn } from "src/network/setup/contractCalls/spawn";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { useShallow } from "zustand/react/shallow";
import { Landing } from "./Landing";

export const Enter: React.FC = () => {
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;
  const navigate = useNavigate();
  const location = useLocation();
  const { noExternalAccount } = usePersistentStore(
    useShallow((state) => ({ noExternalAccount: state.noExternalAccount }))
  );

  const handlePlay = async () => {
    const hasSpawned = !!components.Home.get(playerEntity)?.value;
    if (!hasSpawned) {
      await spawn(mud);
    }

    navigate("/game" + location.search);
  };

  const chain = useNetwork().chain;
  const expectedChain = mud.playerAccount.walletClient.chain;
  const wrongChain = !noExternalAccount && chain?.id !== expectedChain?.id;
  const { isLoading, pendingChainId, switchNetwork } = useSwitchNetwork();

  return (
    <Landing>
      <TransactionQueueMask queueItemId={singletonEntity} className="w-4/5 z-10">
        {wrongChain ? (
          <button
            disabled={!switchNetwork || expectedChain.id === chain?.id}
            onClick={() => switchNetwork?.(expectedChain.id)}
            className="btn join-item inline pointer-events-auto font-bold outline-none h-fit btn-secondary w-full star-background hover:scale-125 relative"
          >
            switch to {expectedChain.name}
            {isLoading && pendingChainId === expectedChain.id && " (switching)"}
          </button>
        ) : (
          <button
            onClick={async () => {
              await handlePlay();
            }}
            className="btn join=item inline pointer-events-auto font-bold outline-none h-fit btn-secondary w-full star-background hover:scale-125 relative"
          >
            Play
          </button>
        )}
      </TransactionQueueMask>
    </Landing>
  );
};
