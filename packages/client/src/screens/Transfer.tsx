import { Entity } from "@latticexyz/recs";
import ERC20Abi from "contracts/out/ERC20System.sol/ERC20System.abi.json";
import { useMemo, useState } from "react";
import { Button } from "src/components/core/Button";
import { AddressDisplay } from "src/components/hud/AddressDisplay";
import { useMud } from "src/hooks";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { getNetworkConfig } from "src/network/config/getNetworkConfig";
import { world } from "src/network/world";
import { wagmiConfig } from "src/util/web3/wagmi";
import {
  BaseError,
  Hex,
  createPublicClient,
  createWalletClient,
  custom,
  encodeAbiParameters,
  formatEther,
  getContract,
  trim,
} from "viem";
import { toAccount } from "viem/accounts";
import { WagmiConfig, useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork } from "wagmi";

export function Transfer() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <div className="flex flex-col justify-center items-center w-screen h-screen bg-neutral font-mono">
        <Connect />
        <ControlBooth />
      </div>
    </WagmiConfig>
  );
}

function Connect() {
  const { connector, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();

  if (isConnected) return null;
  return (
    <div className="card flex flex-col border border-secondary p-2 gap-2 w-72">
      <p className="text-sm">Connect</p>
      {connectors
        .filter((x) => x.ready && x.id !== connector?.id)
        .map((x) => (
          <Button
            className="btn-secondary font-bold w-full"
            key={x.id}
            onClick={() => connect({ connector: x })}
            disabled={isLoading && x.id !== pendingConnector?.id}
          >
            {x.name}
            {isLoading && x.id === pendingConnector?.id && <p className="text-xs">(connecting)</p>}
          </Button>
        ))}
      {error && <p className="fixed top-6 right-6">{(error as BaseError).shortMessage}</p>}
    </div>
  );
}

type Tab = "transfer" | "mint" | "balances";
function ControlBooth() {
  const { network } = useMud();
  const externalAccount = useAccount();
  const { disconnect } = useDisconnect();
  const [tab, setTab] = useState<Tab>("transfer");

  const externalAddress = externalAccount.address;
  const externalEntity = externalAccount.address
    ? (encodeAbiParameters([{ type: "address" }], [externalAccount.address]) as Entity)
    : undefined;

  const adminAddress = components.P_GameConfig.get()?.admin;

  const networkConfig = getNetworkConfig();
  const tokenAddress = components.P_GameConfig2.get()?.wETHAddress;

  const client = useMemo(() => {
    if (!externalAccount || !externalAccount.address || !tokenAddress) return;

    const clientOptions = {
      chain: networkConfig.chain,
      transport: custom(window.ethereum),
      pollingInterval: 1000,
      account: toAccount(externalAccount.address),
    };
    const publicClient = createPublicClient(clientOptions);
    const walletClient = createWalletClient(clientOptions);
    const tokenContract = getContract({
      address: tokenAddress as Hex,
      abi: ERC20Abi,
      publicClient,
      walletClient,
    });
    return { publicClient, walletClient, tokenContract };
  }, [networkConfig.chain, tokenAddress, externalAccount]);

  const burnerAddress = trim(network.address);
  const isAdmin = externalAddress === adminAddress;

  if (!client) return null;

  const onMint = async (address: string, amount: number) => {
    await execute(() => client.tokenContract.write.mint([address as Hex, BigInt(amount)]), network, {
      id: world.registerEntity(),
    });
  };

  const onTransfer = async (address: string, amount: number) => {
    await execute(() => client.tokenContract.write.transfer([address as Hex, BigInt(amount)]), network, {
      id: world.registerEntity(),
    });
  };
  const tabs: Tab[] = isAdmin ? ["transfer", "mint", "balances"] : ["transfer"];
  return (
    <div className="h-full w-full relative flex flex-col justify-center items-center">
      {externalAccount.isConnected && externalAddress && (
        <div className="absolute top-4 left-4 flex gap-4 items-center p-2 bg-base-100 rounded-md">
          <Button className="font-bold btn-secondary btn-sm" onClick={() => disconnect()}>
            Disconnect
          </Button>
          <div className="flex flex-col">
            <div>
              <p className="text-xs text-gray-400 ">Connected to</p>
              <p className="text-sm">
                <AddressDisplay address={externalAddress} />
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 ">Primodium (burner) account</p>
              <p className="text-sm">
                <AddressDisplay address={burnerAddress} />
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        className={`card flex flex-col border border-secondary p-2 gap-2 transition-all ${
          tab !== "balances" ? "w-[512px] h-72" : "w-3/4 h-3/4"
        }`}
      >
        <div className="flex gap-6">
          {tabs.map((tabName) => (
            <button
              key={tabName}
              onClick={() => setTab(tabName)}
              className={`${tab !== tabName ? "opacity-50" : ""}`}
              disabled={tabName === tab}
            >
              {tabName}
            </button>
          ))}
        </div>
        {tab === "transfer" && externalEntity && (
          <TransferToken
            onTransfer={onTransfer}
            className="col-span-2"
            burnerAddress={burnerAddress}
            externalEntity={externalEntity}
          />
        )}
        {tab === "mint" && isAdmin && <MintToken onMint={onMint} className="col-span-2" />}
        {tab === "balances" && isAdmin && <PlayerBalancesTable className="col-span-4" />}
      </div>
    </div>
  );
}

interface MintTokenProps {
  onMint: (address: string, amount: number) => Promise<void>;
  className?: string;
}

interface TransferTokenProps {
  onTransfer: (address: string, amount: number) => Promise<void>;
  className?: string;
  burnerAddress: Hex;
  externalEntity: Entity;
}

const MintToken: React.FC<MintTokenProps> = ({ onMint, className }) => {
  const adminAddress = components.P_GameConfig.get()?.admin;
  const [address, setAddress] = useState<string>(adminAddress ?? "");
  const [amount, setAmount] = useState<string>("");
  const externalAccount = useAccount();
  const chain = useNetwork().chain;
  const expectedChain = externalAccount.connector?.chains[0];
  const { isLoading, pendingChainId, switchNetwork } = useSwitchNetwork();
  const wrongChain = chain?.id !== expectedChain?.id;

  const handleMint = () => {
    const amountNum = Math.round(Number(amount) * 1e18);
    if (address && amountNum > 0) {
      onMint(address, amountNum);
    } else {
      alert("Please enter a valid address and amount.");
    }
  };

  if (!expectedChain) return null;
  const Btn = () =>
    wrongChain ? (
      <Button
        disabled={!switchNetwork || expectedChain.id === chain?.id}
        key={expectedChain.id}
        onClick={() => switchNetwork?.(expectedChain.id)}
        className="btn-secondary grow"
      >
        Switch to {expectedChain.name}
        {isLoading && pendingChainId === expectedChain.id && " (switching)"}
      </Button>
    ) : (
      <Button disabled={!amount || amount === "0" || !address} className="btn-secondary grow" onClick={handleMint}>
        <p>mint</p>
      </Button>
    );

  return (
    <div className={className + " flex flex-col gap-2 h-full"}>
      <input
        type="text"
        className="py-6 px-2 text-sm bg-base-100 border border-secondary/25 disabled:opacity-50"
        placeholder="to"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        disabled={wrongChain}
      />
      <input
        type="number"
        className="py-6 px-2 text-sm bg-base-100 border border-secondary/25 w-full disabled:opacity-50"
        placeholder="amount"
        value={amount}
        disabled={wrongChain}
        onChange={(e) => {
          setAmount(e.target.value);
        }}
      />
      <Btn />
    </div>
  );
};

const TransferToken: React.FC<TransferTokenProps> = ({ onTransfer, className, burnerAddress, externalEntity }) => {
  const [address, setAddress] = useState<string>(trim(burnerAddress) ?? "");
  const [amount, setAmount] = useState<string>("");
  const externalAccount = useAccount();
  const chain = useNetwork().chain;
  const expectedChain = externalAccount.connector?.chains[0];
  const { isLoading, pendingChainId, switchNetwork } = useSwitchNetwork();

  const wrongChain = chain?.id !== expectedChain?.id;
  const balance = components.WETHBalance.use(externalEntity)?.value ?? 0n;

  const handleTransfer = async () => {
    const amountNum = Math.round(Number(amount) * 1e18);
    if (address && amountNum > 0) {
      await onTransfer(address, amountNum);
      setAmount("");
    } else {
      alert("Please enter a valid address and amount.");
    }
  };

  if (!expectedChain) return null;
  const Btn = () =>
    wrongChain ? (
      <Button
        disabled={!switchNetwork || expectedChain.id === chain?.id}
        key={expectedChain.id}
        onClick={() => switchNetwork?.(expectedChain.id)}
        className="btn-secondary grow"
      >
        Switch to {expectedChain.name}
        {isLoading && pendingChainId === expectedChain.id && " (switching)"}
      </Button>
    ) : (
      <Button disabled={!amount || amount === "0" || !address} className="btn-secondary grow" onClick={handleTransfer}>
        <p>transfer</p>
      </Button>
    );

  return (
    <div className={className + " flex flex-col gap-2 h-full"}>
      <input
        type="text"
        className="py-6 px-2 text-sm bg-base-100 border border-secondary/25 disabled:opacity-50"
        placeholder="to"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        disabled={wrongChain}
      />
      <div className="relative flex items-center">
        <div className="absolute right-2 text-xs flex flex-col items-center">
          <Button
            className="btn-secondary btn-xs w-full disabled:opacity-50"
            disabled={wrongChain || formatEther(balance) === amount}
            onClick={() => setAmount(formatEther(balance))}
          >
            max
          </Button>
          {!wrongChain && <p className="text-gray-400">Balance: {formatEther(balance)}</p>}
        </div>
        <input
          type="number"
          className="py-6 px-2 text-sm bg-base-100 border border-secondary/25 w-full disabled:opacity-50"
          placeholder="amount"
          value={amount}
          disabled={wrongChain}
          onChange={(e) => {
            const value = Number(e.target.value);
            const bal = Number(balance) / 1e18;
            if (value < 0) {
              setAmount("");
              return;
            }
            if (value > bal) {
              return;
            }
            setAmount(e.target.value);
          }}
        />
      </div>
      <Btn />
    </div>
  );
};

const PlayerBalancesTable = ({ className }: { className?: string }) => {
  const players = components.WETHBalance.useAll().map((player) => ({
    entity: player,
    balance: components.WETHBalance.get(player)?.value ?? 0n,
  }));
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredPlayers = players.filter((player) => player.entity.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={className + " overflow-auto"}>
      <div className="flex justify-between items-center font-medium p-2 bg-primary">
        <div className="flex gap-10 items-center">
          <p>Address</p>
          <input
            type="text"
            className="p-1 text-sm bg-base-100 border border-secondary/25 w-full disabled:opacity-50"
            placeholder="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <p>Balance (WETH)</p>
      </div>
      {filteredPlayers.map((player) => {
        return (
          <div key={`balance-${player.entity}`} className="flex justify-between p-2 whitespace-nowrap border-b-2">
            <p>{trim(player.entity as Hex)}</p>
            <p>{formatEther(player.balance)}</p>
          </div>
        );
      })}
    </div>
  );
};
