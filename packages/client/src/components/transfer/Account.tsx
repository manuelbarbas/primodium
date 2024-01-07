import ERC20Abi from "contracts/out/ERC20System.sol/ERC20System.abi.json";
import { useMemo } from "react";
import { ampli } from "src/ampli";
import { useMud } from "src/hooks";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { parseReceipt } from "src/util/analytics/parseReceipt";
import { Hex, getContract } from "viem";
import { AccountDisplay } from "../shared/AccountDisplay";
import { Delegate } from "./Delegate";
import { TransferToken } from "./TransferToken";

export function Account() {
  const mud = useMud();
  const { playerAccount } = mud;

  const tokenAddress = components.P_GameConfig2.use()?.wETHAddress;

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
      <div className="flex gap-2 w-full items-center px-4">
        <AccountDisplay noColor player={playerAccount.entity} className="text-sm" disabled />
      </div>
      <div className="p-2 h-full w-full flex flex-col gap-6">
        <Delegate />
        <TransferToken onTransfer={onTransfer} className="border border-secondary p-6" />
      </div>
    </div>
  );
}
