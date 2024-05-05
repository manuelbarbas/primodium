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
import { components } from "src/network/components";
import { Landing } from "./Landing";

export const Enter: React.FC = () => {
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;
  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = useState<"loading" | "delegate" | "play">("loading");

  useEffect(() => {
    if (!mud.sessionAccount) {
      setState("delegate");
    } else {
      setState("play");
    }
  }, [mud.sessionAccount]);

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

    await grantAccessWithSignature(mud, privateKey, { id: singletonEntity });
  };

  return (
    <Landing>
      <TransactionQueueMask queueItemId={singletonEntity} className="w-4/5 z-10">
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
