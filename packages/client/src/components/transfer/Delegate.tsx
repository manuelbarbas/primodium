import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMemo, useState } from "react";
import { FaClipboard, FaExclamationCircle, FaLink, FaPlus, FaQuestionCircle, FaTrash, FaUnlink } from "react-icons/fa";
import { useMud } from "src/hooks";
import { grantAccess, revokeAccessOwner, switchDelegate } from "src/network/setup/contractCalls/access";
import { findEntriesWithPrefix } from "src/util/burner";
import { copyToClipboard } from "src/util/clipboard";
import { STORAGE_PREFIX } from "src/util/constants";
import { Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Badge } from "../core/Badge";
import { Button } from "../core/Button";
import { Tooltip } from "../core/Tooltip";
import { AddressDisplay } from "../hud/AddressDisplay";
import { TransactionQueueMask } from "../shared/TransactionQueueMask";

const sessionWalletTooltip =
  "Link a locally stored session account to perform low-risk actions without requiring external confirmation.";

export function Delegate() {
  const mud = useMud();
  const { sessionAccount } = mud;
  const [keyUpdate, setKeyUpdate] = useState(0); // state to trigger updates

  // Function to handle private key validation and connection
  const delegate = sessionAccount?.entity;
  const delegateAddress = sessionAccount?.address;

  const savePrivateKey = async (privateKey: string) => {
    const account = privateKeyToAccount(privateKey as Hex);
    localStorage.setItem(STORAGE_PREFIX + account.address, privateKey);
    setKeyUpdate((prev) => prev + 1); // increment to trigger update
  };

  const submitPrivateKey = async (privateKey: string) => {
    // Validate the private key format here
    // This is a basic example, adjust the validation according to your requirements
    console.log("submitPrivateKey", privateKey);
    const isValid = /^0x[a-fA-F0-9]{64}$/.test(privateKey);
    if (!isValid) return;
    const account = privateKeyToAccount(privateKey as Hex);

    if (delegateAddress && delegateAddress === account.address) return;
    if (delegate) await switchDelegate(mud, account.address);
    else await grantAccess(mud, account.address);

    setKeyUpdate((prev) => prev + 1); // increment to trigger update
  };

  const handleRandomPress = () => {
    const randomPKey = generatePrivateKey();
    savePrivateKey(randomPKey);
    return randomPKey;
  };

  const removeSessionKey = (publicKey: string) => {
    localStorage.removeItem(STORAGE_PREFIX + publicKey);
    setKeyUpdate((prev) => prev + 1); // increment to trigger update
  };
  const accounts = useMemo(() => findEntriesWithPrefix(), [keyUpdate]);

  return (
    <div className="flex flex-col gap-2 text-left border border-secondary p-4 bg-base-100">
      <div className="text-xs font-bold uppercase flex gap-2 items-center">
        <p className="opacity-50">Session Account</p>
        <Tooltip text={sessionWalletTooltip} direction="top" className="text-xs normal-case">
          <div>
            <FaQuestionCircle className="opacity-50" />
          </div>
        </Tooltip>
      </div>
      <TransactionQueueMask queueItemId={singletonEntity}>
        <Badge className="w-full flex bg-black/30 p-6">
          {delegateAddress ? (
            <div className="w-full flex items-center justify-between">
              <AddressDisplay address={delegateAddress} notShort className="font-bold" />
              <div className="flex">
                <Button
                  onClick={async () => revokeAccessOwner(mud)}
                  tooltip="Unlink"
                  tooltipDirection="top"
                  className="btn-xs btn-ghost"
                >
                  <FaUnlink />
                </Button>

                <Button
                  tooltip="Copy address"
                  onClick={() => copyToClipboard(delegateAddress, "address")}
                  tooltipDirection="top"
                  className="btn-xs btn-ghost"
                >
                  <FaClipboard />
                </Button>
                {sessionAccount?.privateKey && (
                  <Button
                    tooltip="Copy Private Key"
                    onClick={() => copyToClipboard(sessionAccount.privateKey, "private key")}
                    tooltipDirection="top"
                    className="btn-xs btn-ghost"
                  >
                    <FaExclamationCircle className="text-error" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="uppercase font-bold text-sm font-left flex items-center gap-2">
              <p>INACTIVE</p>
              {accounts.length < 6 && (
                <Button
                  tooltip="link new account"
                  tooltipDirection="bottom"
                  onClick={() => {
                    const key = handleRandomPress();
                    submitPrivateKey(key);
                  }}
                  className="btn-ghost btn-xs"
                >
                  <FaPlus />
                </Button>
              )}
            </div>
          )}
        </Badge>
      </TransactionQueueMask>
      <p className="text-xs opacity-50 font-bold uppercase flex gap-2 items-center">local accounts</p>
      <div className="grid grid-cols-3 grid-rows-2 gap-1">
        {accounts.map((account) => (
          <Badge className="flex flex-col w-full h-full gap-1 p-2 bg-black/30" key={`account-${account.publicKey}`}>
            <AddressDisplay address={account.publicKey as Hex} className="font-bold" />
            {account.publicKey == delegateAddress ? (
              <p className="text-xs bold uppercase opacity-70 font-bold">ACTIVE</p>
            ) : (
              <div className="flex">
                <Button tooltip="Link" tooltipDirection="bottom" className="btn-xs btn-ghost">
                  <FaLink onClick={async () => submitPrivateKey(account.privateKey)} />
                </Button>
                <Button
                  tooltip="Copy address"
                  onClick={() => copyToClipboard(account.publicKey, "address")}
                  tooltipDirection="bottom"
                  className="btn-xs btn-ghost"
                >
                  <FaClipboard />
                </Button>
                <Button
                  tooltip="Copy Private Key"
                  onClick={() => copyToClipboard(account.privateKey, "private key")}
                  tooltipDirection="bottom"
                  className="btn-xs btn-ghost"
                >
                  <FaExclamationCircle className="text-error" />
                </Button>
                <Button tooltip="Delete" tooltipDirection="bottom" className="btn-xs btn-ghost">
                  <FaTrash onClick={() => removeSessionKey(account.publicKey)} />
                </Button>
              </div>
            )}
          </Badge>
        ))}
        {accounts.length < 6 && (
          <Button
            tooltip="new ACcount"
            tooltipDirection="bottom"
            onClick={handleRandomPress}
            className="btn-primary flex flex-col w-full h-full gap-2 p-2 bg-black/30"
            style={{ height: "100%" }}
          >
            <FaPlus />
          </Button>
        )}
      </div>
    </div>
  );
}
