import { Entity } from "@latticexyz/recs";
import ERC20Abi from "contracts/out/ERC20System.sol/ERC20System.abi.json";
import { useMemo, useState } from "react";
import { GameButton } from "src/components/shared/GameButton";
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

export function Connect() {
  const { connector, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="space-y-3 my-3 relative">
        <GameButton className="absolute top-6 left-6 font-bold w-44" depth={5} onClick={() => disconnect()}>
          <div className="font-bold leading-none h-8 flex justify-center items-center crt px-2">Disconnect</div>
        </GameButton>
      </div>
    );
  }
  return (
    <div className="space-y-3 my-3">
      <p>Connect the wallet you want to display on the leaderboard.</p>
      {connectors
        .filter((x) => x.ready && x.id !== connector?.id)
        .map((x) => (
          <GameButton className="font-bold w-44" depth={5} key={x.id} onClick={() => connect({ connector: x })}>
            <div className="font-bold leading-none h-8 flex justify-center items-center crt px-2">
              {x.name}
              {isLoading && x.id === pendingConnector?.id && " (connecting)"}
            </div>
          </GameButton>
        ))}
      {error && <p className="fixed top-6 right-6">{(error as BaseError).shortMessage}</p>}
    </div>
  );
}

export function Admin() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <div className="flex flex-col w-screen h-screen bg-black text-green-400 p-20 font-mono">
        <Connect />
        <Connected>
          <ControlBooth />
        </Connected>
      </div>
    </WagmiConfig>
  );
}

export function Connected({ children }: { children: React.ReactNode }) {
  const { isConnected, connector } = useAccount();
  const chain = useNetwork().chain;
  const expectedChain = connector?.chains[0].id;
  const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork();

  if (!isConnected) return null;
  if (chain?.id !== expectedChain) {
    return (
      <>
        {chain && <div>Connected to {chain.name}</div>}

        {chains.map((x) => (
          <GameButton disabled={!switchNetwork || x.id === chain?.id} key={x.id} onClick={() => switchNetwork?.(x.id)}>
            Switch to {x.name}
            {isLoading && pendingChainId === x.id && " (switching)"}
          </GameButton>
        ))}

        <div>{error && error.message}</div>
      </>
    );
  }
  return <>{children}</>;
}

function ControlBooth() {
  const { network } = useMud();
  const externalAccount = useAccount();

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
  const balance = components.WETHBalance.use(externalEntity)?.value ?? 0n;
  const isAdmin = externalAddress === adminAddress;

  if (!client)
    return (
      <div className="flex flex-col w-screen h-screen bg-black text-green-400 p-20 font-mono">
        <p>loading...</p>
      </div>
    );

  const onMint = async (address: string, amount: number) => {
    await execute(
      () => client.tokenContract.write.mint([address as Hex, BigInt(amount)]),
      network,
      {
        id: world.registerEntity(),
      },
      () => {
        alert("Minted " + formatEther(BigInt(amount)) + " tokens to " + address);
      }
    );
  };

  const onTransfer = async (address: string, amount: number) => {
    await execute(
      () => client.tokenContract.write.transfer([address as Hex, BigInt(amount)]),
      network,
      {
        id: world.registerEntity(),
      },
      () => {
        alert("Transferred " + formatEther(BigInt(amount)) + " tokens to " + address);
      }
    );
  };
  const pad = 30;
  return (
    <div className="flex flex-col w-screen h-screen bg-black text-green-400 p-20 font-mono">
      {client && (
        <div className="flex flex-col gap-2">
          <p>
            {"external address".padEnd(pad, ".")}
            {externalAddress}
            {adminAddress === externalAddress && " (admin)"}
          </p>
          <p>
            {"Primodium (burner) address".padEnd(pad, ".")}
            {burnerAddress}
            {adminAddress === burnerAddress && " (admin)"}
          </p>
          <p>
            {"balance".padEnd(pad, ".")}
            {formatEther(balance)}
          </p>

          <div className="grid grid-cols-4 gap-4">
            {isAdmin && <MintToken onMint={onMint} className="col-span-2" />}
            {externalEntity && (
              <TransferToken
                onTransfer={onTransfer}
                className="col-span-2"
                burnerAddress={burnerAddress}
                externalEntity={externalEntity}
              />
            )}
            {isAdmin && <PlayerBalancesTable className="col-span-4" />}
          </div>
        </div>
      )}
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

  const handleMint = () => {
    const amountNum = Math.round(Number(amount) * 1e18);
    if (address && amountNum > 0) {
      onMint(address, amountNum);
    } else {
      alert("Please enter a valid address and amount.");
    }
  };

  return (
    <div className={className + " flex flex-col gap-1"}>
      <p>mint</p>
      <input
        type="text"
        className="p-2 border border-green-400 bg-black"
        placeholder="address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <input
        type="number"
        className="p-2 border border-green-400 bg-black"
        placeholder="amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button className="p-2 bg-green-400 text-black " onClick={handleMint}>
        mint token
      </button>
    </div>
  );
};

const TransferToken: React.FC<TransferTokenProps> = ({ onTransfer, className, burnerAddress, externalEntity }) => {
  const [address, setAddress] = useState<string>(trim(burnerAddress) ?? "");
  const [amount, setAmount] = useState<string>("");

  const balance = components.WETHBalance.use(externalEntity)?.value ?? 0n;

  const handleTransfer = async () => {
    const amountNum = Math.round(Number(amount) * 1e18);
    if (address && amountNum > 0) {
      await onTransfer(address, amountNum);
      setAmount("");
      setAddress("");
    } else {
      alert("Please enter a valid address and amount.");
    }
  };

  return (
    <div className={className + " flex flex-col gap-1"}>
      <p>transfer</p>
      <input
        type="text"
        className="p-2 border border-green-400 bg-black"
        placeholder="to"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <div className="relative flex items-center">
        <button
          className="absolute right-2 margin-auto bg-green-400 text-black px-2 flex items-center"
          onClick={() => setAmount(formatEther(balance))}
        >
          max
        </button>
        <input
          type="number"
          className="p-2 border border-green-400 bg-black w-full"
          placeholder="amount"
          value={amount}
          onChange={(e) => {
            const value = Number(e.target.value);
            const bal = Number(balance) / 1e18;
            console.log("value", value, "balance", bal);
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
      <button className="p-2 bg-green-400 text-black " onClick={handleTransfer}>
        transfer token
      </button>
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
      <p>balances</p>
      <div className="flex justify-between items-center font-medium p-1 text-black uppercase bg-green-400">
        <div className="flex gap-10 items-center">
          <p>Address</p>
          <input
            type="text"
            className="bg-transparent font-black placeholder-black p-1 text-xs font-light border border-black border-2"
            placeholder="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <p>Balance (WETH)</p>
      </div>
      {[...filteredPlayers].map((player) => {
        return (
          <div key={`balance-${player.entity}`} className="flex justify-between p-2 whitespace-nowrap text-green-400">
            <p>{trim(player.entity as Hex)}</p>

            <p>{formatEther(player.balance)}</p>
          </div>
        );
      })}
    </div>
  );
};
