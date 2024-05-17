import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMud } from "src/hooks";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import { Tooltip } from "@/components/core/Tooltip";
import { grantAccessWithSignature } from "@/network/setup/contractCalls/access";
import { spawn } from "@/network/setup/contractCalls/spawn";
import { STORAGE_PREFIX } from "@/util/constants";
import { findEntriesWithPrefix } from "@/util/localStorage";
import { useEffect, useState } from "react";
import { FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
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
  const [showingToast, setShowingToast] = useState(false);

  const [state, setState] = useState<"loading" | "delegate" | "play">("loading");
  const confirmSkip = async () => {
    toast.dismiss();
    if (showingToast) await new Promise((resolve) => setTimeout(resolve, 500));
    setShowingToast(true);
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col text-center justify-center items-center gap-2 w-full">
            <FaExclamationTriangle size={24} className="text-warning" />
            Are you sure you want to skip? You will need to confirm every action with your external wallet.
          </div>

          <div className="flex justify-center w-full gap-2">
            <button
              className="btn btn-secondary btn-xs"
              onClick={() => {
                setState("play");
                closeToast && closeToast();
              }}
            >
              Confirm
            </button>
            <button
              onClick={() => {
                setShowingToast(false);
                closeToast && closeToast();
              }}
              className="btn btn-primary btn-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        // className: "border-error",
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        hideProgressBar: true,
      }
    );
  };
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
    const storedKeys = findEntriesWithPrefix();
    const privateKey = storedKeys.length > 0 ? storedKeys[0].privateKey : generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    localStorage.setItem(STORAGE_PREFIX + account.address, privateKey);

    await grantAccessWithSignature(mud, privateKey, { id: singletonEntity });
  };

  return (
    <Landing>
      <TransactionQueueMask queueItemId={singletonEntity} className="w-4/5 z-20">
        {state === "delegate" && (
          <div className="grid grid-cols-7 gap-2 items-center pointer-events-auto">
            <button
              onClick={handleDelegate}
              className="relative btn col-span-6 font-bold outline-none h-fit btn-secondary w-full star-background hover:scale-105"
            >
              <Tooltip
                className="w-56 text-left h-fit text-wrap"
                tooltipContent="Bypass annoying confirmation popups by authorizing a session account. This allows you to securely perform certain actions without external confirmation."
                direction="bottom"
              >
                <div className="flex items-center justify-center">
                  <FaInfoCircle className="w-6 text-info" />
                </div>
              </Tooltip>
              Authorize Delegate
            </button>
            <button onClick={confirmSkip} className="btn btn-neutral opacity-80 hover:scale-110">
              Skip
            </button>
          </div>
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
