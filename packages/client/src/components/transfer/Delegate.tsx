import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useEffect, useState } from "react";
import { FaClipboard, FaExclamationCircle, FaEye, FaEyeSlash, FaInfoCircle, FaTimes, FaUnlink } from "react-icons/fa";
import { useMud } from "src/hooks";
import { grantAccess, revokeAccessOwner, switchDelegate } from "src/network/setup/contractCalls/access";
import { copyToClipboard } from "src/util/clipboard";
import { STORAGE_PREFIX } from "src/util/constants";
import { Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Button } from "../core/Button";
import { Card, SecondaryCard } from "../core/Card";
import { TransactionQueueMask } from "../shared/TransactionQueueMask";

const sessionWalletTooltip =
  "Bypass annoying confirmation popups by linking a delegate account. This allows you to securely perform certain actions without external confirmation.";

export function Delegate() {
  const mud = useMud();
  const { sessionAccount } = mud;
  const [showDetails, setShowDetails] = useState(false);
  const [showHelp, setShowHelp] = useState(!localStorage.getItem("hideHelp"));

  useEffect(() => {
    setShowDetails(false);
  }, [sessionAccount]);

  // Function to handle private key validation and connection
  const delegate = sessionAccount?.entity;
  const delegateAddress = sessionAccount?.address;

  const savePrivateKey = async (privateKey: string) => {
    const account = privateKeyToAccount(privateKey as Hex);
    localStorage.setItem(STORAGE_PREFIX + account.address, privateKey);
  };

  const submitPrivateKey = async (privateKey: string) => {
    // Validate the private key format here
    // This is a basic example, adjust the validation according to your requirements
    const isValid = /^0x[a-fA-F0-9]{64}$/.test(privateKey);
    if (!isValid) return;
    const account = privateKeyToAccount(privateKey as Hex);

    if (delegateAddress && delegateAddress === account.address) return;
    if (delegate) await switchDelegate(mud, account.address);
    else await grantAccess(mud, account.address);
  };

  const handleRandomPress = () => {
    const randomPKey = generatePrivateKey();
    savePrivateKey(randomPKey);
    return randomPKey;
  };

  const removeSessionKey = (publicKey: string) => {
    localStorage.removeItem(STORAGE_PREFIX + publicKey);
  };

  const hideHelp = () => {
    setShowHelp(false);
    localStorage.setItem("hideHelp", "true");
  };

  return (
    <Card className="bg-base-100 gap-1">
      <div className="text-xs font-bold uppercase flex gap-2 items-center">
        <p className="opacity-50">Delegate</p>
      </div>

      {showHelp && (
        <SecondaryCard className="flex flex-row gap-1 relative p-4">
          <FaInfoCircle className="w-6" />
          <div className="text-xs italic opacity-75 space-y-2">{sessionWalletTooltip}</div>
          <Button className="btn-ghost btn-xs absolute top-0 right-0" onClick={hideHelp}>
            <FaTimes />
          </Button>
        </SecondaryCard>
      )}

      <TransactionQueueMask queueItemId={singletonEntity}>
        {delegateAddress ? (
          <div className="w-full flex flex-col">
            <div className="w-full flex items-center justify-center p-4">
              <p className="uppercase font-bold text-success w-full flex justify-center text-sm">LINKED</p>
              <div className="absolute right-2 flex gap-1">
                <Button
                  onClick={async () => {
                    setShowDetails(false);
                    revokeAccessOwner(mud);
                    removeSessionKey(delegateAddress);
                  }}
                  tooltip="Unlink"
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
                    <span className="font-bold">Address: </span>
                    <p>{delegateAddress}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      tooltip="Copy address"
                      onClick={() => copyToClipboard(delegateAddress, "address")}
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
            CLICK TO LINK DELEGATE
          </Button>
        )}
      </TransactionQueueMask>
    </Card>
  );
}
