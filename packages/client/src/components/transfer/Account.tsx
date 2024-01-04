import ERC20Abi from "contracts/out/ERC20System.sol/ERC20System.abi.json";
import { useMemo, useState } from "react";
import { ampli } from "src/ampli";
import { useMud } from "src/hooks";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { parseReceipt } from "src/util/analytics/parseReceipt";
import { Hex, getContract } from "viem";
import { Button } from "../core/Button";
import { Link } from "./Link";
import { MintToken } from "./MintToken";
import { PlayerBalances } from "./PlayerBalances";
import { TransferToken } from "./TransferToken";

type Tab = "transfer" | "mint" | "balances" | "link";

export function Account() {
  const mud = useMud();
  const { playerAccount } = mud;
  const [tab, setTab] = useState<Tab>("link");

  const adminAddress = components.P_GameConfig.use()?.admin;

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

  const isAdmin = playerAccount.address === adminAddress;

  const onMint = async (address: string, amount: bigint) => {
    if (!tokenContract) return;
    await execute(
      mud,
      () => tokenContract.write.mint([address as Hex, BigInt(amount)]),
      {
        id: world.registerEntity(),
      },
      (receipt) => {
        ampli.tokenMint({
          tokenMintTo: address,
          tokenValue: amount.toString(),
          ...parseReceipt(receipt),
        });
      }
    );
  };

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

  const tabs: Tab[] = isAdmin ? ["link", "transfer", "mint", "balances"] : ["link", "transfer"];
  return (
    <div className="h-full w-full relative flex flex-col justify-center items-center">
      <div
        className={`card flex flex-col border border-secondary p-2 gap-2 transition-all ${
          tab !== "balances" ? "w-[512px] h-72" : "w-3/4 h-3/4"
        }`}
      >
        <div className="flex gap-6">
          {tabs.map((tabName) => (
            <Button
              className={`${tab === tabName ? "btn-secondary" : "btn-ghost"}`}
              key={`tab-${tabName}`}
              onClick={() => setTab(tabName)}
            >
              {tabName}
            </Button>
          ))}
        </div>
        {tab === "transfer" && <TransferToken onTransfer={onTransfer} className="col-span-2" />}
        {tab === "mint" && isAdmin && <MintToken onMint={onMint} className="col-span-2" />}
        {tab === "balances" && isAdmin && <PlayerBalances className="col-span-4" />}
        {(!tab || tab === "link") && <Link />}
      </div>
    </div>
  );
}
