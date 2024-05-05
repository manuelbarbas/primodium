import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMud } from "src/hooks";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import { grantAccessWithSignature } from "@/network/setup/contractCalls/access";
import { spawn } from "@/network/setup/contractCalls/spawn";
import { STORAGE_PREFIX } from "@/util/constants";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { usePersistentStore } from "src/game/stores/PersistentStore";
import { components } from "src/network/components";
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
  const [state, setState] = useState<"loading" | "wrongChain" | "delegate" | "play">("loading");

  const chain = useConfig().state.chainId;
  const expectedChain = mud.playerAccount.walletClient.chain;
  const wrongChain = !noExternalAccount && chain !== expectedChain?.id;
  const { isPending, switchChain } = useSwitchChain();

  useEffect(() => {
    if (wrongChain) {
      return setState("wrongChain");
    }
    if (!mud.sessionAccount) {
      setState("delegate");
    } else {
      setState("play");
    }
  }, [wrongChain, mud.sessionAccount]);

  useEffect(() => {
    if (!mud.sessionAccount) return;
    toast.success(`Session account detected! (${mud.sessionAccount.address.slice(0, 7)})`);
  }, [mud.sessionAccount]);

  const handlePlay = async () => {
    const hasSpawned = !!components.Home.get(playerEntity)?.value;
    if (!hasSpawned) {
      await spawn(mud);
    }
    navigate("/game" + location.search);
  };

  const handleDelegate = async () => {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    localStorage.setItem(STORAGE_PREFIX + account.address, privateKey);

    await grantAccessWithSignature(mud, privateKey);
  };

  return (
    <Landing>
      <TransactionQueueMask queueItemId={singletonEntity} className="w-4/5 z-10">
        {state === "wrongChain" && (
          <button
            disabled={expectedChain.id === chain}
            onClick={() => switchChain({ chainId: expectedChain.id })}
            className="btn join-item inline pointer-events-auto font-bold outline-none h-fit btn-secondary w-full star-background hover:scale-125 relative"
          >
            switch to {expectedChain.name}
            {isPending && " (switching)"}
          </button>
        )}
        {state === "delegate" && (
          <button
            onClick={handleDelegate}
            className="btn join=item inline pointer-events-auto font-bold outline-none h-fit btn-secondary w-full star-background hover:scale-125 relative"
          >
            Authorize Delegate
          </button>
        )}
        {state === "play" && (
          <button
            onClick={handlePlay}
            className="btn join=item inline pointer-events-auto font-bold outline-none h-fit btn-secondary w-full star-background hover:scale-125 relative"
          >
            Play
          </button>
        )}
      </TransactionQueueMask>
    </Landing>
  );
};
