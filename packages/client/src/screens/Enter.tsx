import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMud } from "src/hooks";
import { STORAGE_PREFIX } from "src/util/constants";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import { useLocation, useNavigate } from "react-router-dom";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { usePersistentStore } from "src/game/stores/PersistentStore";
import { components } from "src/network/components";
import { spawnAndAuthorizeSessionAccount } from "src/network/setup/contractCalls/spawn";
import { useConfig, useSwitchChain } from "wagmi";
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
      const privateKey = generatePrivateKey();
      const account = privateKeyToAccount(privateKey);
      localStorage.setItem(STORAGE_PREFIX + account.address, privateKey);

      await spawnAndAuthorizeSessionAccount(mud, account.address);
    }

    navigate("/game" + location.search);
  };

  const chain = useConfig().state.chainId;
  const expectedChain = mud.playerAccount.walletClient.chain;
  const wrongChain = !noExternalAccount && chain !== expectedChain?.id;
  const { isPending, switchChain } = useSwitchChain();

  return (
    <Landing>
      <TransactionQueueMask queueItemId={singletonEntity} className="w-4/5 z-10">
        {wrongChain ? (
          <button
            disabled={expectedChain.id === chain}
            onClick={() => switchChain({ chainId: expectedChain.id })}
            className="btn join-item inline pointer-events-auto font-bold outline-none h-fit btn-secondary w-full star-background hover:scale-125 relative"
          >
            switch to {expectedChain.name}
            {isPending && " (switching)"}
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
