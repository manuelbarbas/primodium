import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useEffect, useState } from "react";
import { FaClipboard, FaExclamationCircle, FaEye, FaEyeSlash, FaInfoCircle, FaTimes, FaUnlink } from "react-icons/fa";
import { useMud } from "src/hooks";
import { grantAccess, revokeAccess } from "src/network/setup/contractCalls/access";
import { copyToClipboard } from "src/util/clipboard";
import { STORAGE_PREFIX } from "src/util/constants";
import { Address, Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Button } from "../core/Button";
import { SecondaryCard } from "../core/Card";
import { TransactionQueueMask } from "../shared/TransactionQueueMask";

const sessionWalletTooltip =
  "Bypass annoying confirmation popups by authorizing a session account. This allows you to securely perform certain actions without external confirmation.";

export function Authorize() {
  const mud = useMud();
  const { sessionAccount } = mud;
  const [showDetails, setShowDetails] = useState(false);
  const [showHelp, setShowHelp] = useState(!localStorage.getItem("hideHelp"));

  useEffect(() => {
    setShowDetails(false);
  }, [sessionAccount]);

  // Function to handle private key validation and connection
  const sessionAddress = sessionAccount?.address;

  const submitPrivateKey = async (privateKey: string) => {
    // Validate the private key format here
    // This is a basic example, adjust the validation according to your requirements
    const isValid = /^0x[a-fA-F0-9]{64}$/.test(privateKey);
    if (!isValid) return;
    const account = privateKeyToAccount(privateKey as Hex);

    if (sessionAddress && sessionAddress === account.address) return;
    else await grantAccess(mud, account.address);
  };

  const handleRandomPress = () => {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey as Hex);
    localStorage.setItem(STORAGE_PREFIX + account.address, privateKey);

    return privateKey;
  };

  const removeSessionKey = async (publicKey: Address) => {
    await revokeAccess(mud, publicKey);
    localStorage.removeItem(STORAGE_PREFIX + publicKey);
  };

  const hideHelp = () => {
    setShowHelp(false);
    localStorage.setItem("hideHelp", "true");
  };

  return (
    <SecondaryCard className="gap-1">
      {showHelp && (
        <SecondaryCard className="flex flex-row gap-1 relative p-4 bg-info/50">
          <FaInfoCircle className="w-6" />
          <div className="text-xs opacity-75 space-y-2 normal-case">{sessionWalletTooltip}</div>
          <Button className="btn-ghost btn-xs absolute top-0 right-0" onClick={hideHelp}>
            <FaTimes />
          </Button>
        </SecondaryCard>
      )}

      <TransactionQueueMask queueItemId={singletonEntity}>
        {sessionAddress ? (
          <div className="w-full flex flex-col">
            <div className="w-full flex items-center justify-center p-4">
              <p className="uppercase font-bold text-success w-full flex justify-center text-sm">
                AUTHORIZING SESSION ACCOUNT
              </p>
              <div className="absolute right-2 flex gap-1">
                <Button
                  onClick={async () => {
                    setShowDetails(false);
                    revokeAccess(mud, sessionAddress);
                    removeSessionKey(sessionAddress);
                  }}
                  tooltip="stop authorizing"
                  tooltipDirection="top"
                  className="btn-sm btn-primary"
                >
                  <FaUnlink />
                </Button>
                <Button
                  tooltip={`${showDetails ? "Hide" : "See"} details`}
                  onClick={() => setShowDetails((prev) => !prev)}
                  tooltipDirection="top"
                  className="btn-sm btn-primary"
                >
                  {showDetails ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </div>
            </div>
            {showDetails && (
              <SecondaryCard className="flex flex-col gap-2 p-3 w-full animate-slide-down bg-base-800">
                <div className="text-sm flex justify-between items-center">
                  <div>
                    <span className="font-bold">Session Address: </span>
                    <p>{sessionAddress}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      tooltip="Copy address"
                      onClick={() => copyToClipboard(sessionAddress, "address")}
                      tooltipDirection="top"
                      className="btn-sm btn-primary"
                    >
                      <FaClipboard />
                    </Button>
                    <Button
                      tooltip={`Copy private key`}
                      onClick={() => copyToClipboard(sessionAccount?.privateKey, "private key")}
                      tooltipDirection="top"
                      className="btn-sm btn-error"
                    >
                      <FaExclamationCircle />
                    </Button>
                  </div>
                </div>
              </SecondaryCard>
            )}
          </div>
        ) : (
          <Button
            className="btn-primary w-full"
            onClick={() => {
              const key = handleRandomPress();
              submitPrivateKey(key);
            }}
          >
            CLICK TO AUTHORIZE SESSION ACCOUNT
          </Button>
        )}
      </TransactionQueueMask>
    </SecondaryCard>
  );
}
