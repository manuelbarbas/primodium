import ERC20Abi from "contracts/out/ERC20System.sol/ERC20System.abi.json";
import { useMemo } from "react";
import { FaClipboard, FaExclamationCircle, FaTrash } from "react-icons/fa";
import { ampli } from "src/ampli";
import { useMud } from "src/hooks";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { parseReceipt } from "src/util/analytics/parseReceipt";
import { copyToClipboard } from "src/util/clipboard";
import { Hex, getContract } from "viem";
import { Button } from "../core/Button";
import { AccountDisplay } from "../shared/AccountDisplay";
import { Delegate } from "./Delegate";
import { TransferToken } from "./TransferToken";

export function Account() {
  const mud = useMud();
  const { playerAccount } = mud;

  const tokenAddress = components.P_GameConfig2.use()?.wETHAddress;

  const removeBurnerPlayerAccount = () => {
    const go = confirm(
      `Are you sure you want to delete your player account? Don't forget to save your keys!\n Public key: ${playerAccount.address}\n Private key: ${playerAccount.privateKey}`
    );
    if (!go) return;
    localStorage.removeItem("primodiumPlayerAccount");
    window.location.reload();
  };

  const tokenContract = useMemo(() => {
    if (!tokenAddress) return;

    return getContract({
      address: tokenAddress as Hex,
      abi: ERC20Abi,
      publicClient: playerAccount.publicClient,
      walletClient: playerAccount.walletClient,
    });
  }, [playerAccount.publicClient, playerAccount.walletClient, tokenAddress]);

  const onTransfer = async (address: string, amount: bigint) => {
    if (!tokenContract) return;
    await execute(
      mud,
      () => tokenContract.write.transfer([address as Hex, amount]),
      {
        id: world.registerEntity(),
      },
      (receipt) => {
        ampli.tokenTransfer({
          tokenTransferTo: address,
          tokenValue: amount.toString(),
          ...parseReceipt(receipt),
        });
      }
    );
  };

  return (
    <div className="h-full w-full relative flex flex-col justify-center items-center">
      <div className="flex w-full items-center px-4">
        <AccountDisplay noColor player={playerAccount.entity} className="text-sm" disabled />
        {!!playerAccount.privateKey && (
          <>
            <Button
              tooltip="Copy address"
              onClick={() => copyToClipboard(playerAccount.address, "address")}
              tooltipDirection="top"
              className="btn-xs btn-ghost"
            >
              <FaClipboard />
            </Button>
            <Button
              tooltip="Copy Private Key"
              onClick={() => copyToClipboard(playerAccount.privateKey, "private key")}
              tooltipDirection="top"
              className="btn-xs btn-ghost"
            >
              <FaExclamationCircle className="text-error" />
            </Button>
            <Button className="btn-xs" onClick={removeBurnerPlayerAccount} tooltip="delete and reload with new account">
              <FaTrash />
            </Button>
          </>
        )}
      </div>
      <div className="p-2 h-full w-full flex flex-col gap-6">
        <Delegate />
        <TransferToken onTransfer={onTransfer} />
      </div>
    </div>
  );
}
