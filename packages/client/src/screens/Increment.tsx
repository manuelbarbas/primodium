import { SingletonID } from "@latticexyz/network";
import {
  Counter,
  IsDebug,
  P_RequiredResources,
} from "src/network/components/chainComponents";
import { DoubleCounter } from "src/network/components/clientComponents";
import { Fragment, useMemo, useState } from "react";
import {
  BackgroundImage,
  BlockType,
  ResearchImage,
  ResourceImage,
} from "src/util/constants";
import { getBlockTypeName } from "src/util/common";
import { useMud } from "src/hooks";
import { increment } from "src/util/web3";
import { ethers } from "ethers";
import { getNetworkLayerConfig } from "src/network/config/config";
import P_RequiredResourcesJson from "../../../contracts/abi/P_RequiredResourcesComponent.json";
import { ResourceValuesStruct } from "../../../contracts/types/ethers-contracts/P_RequiredResourcesComponent";
import World from "../../../contracts/abi/World.json";
import { hashKeyEntity } from "src/util/encode";
import { keccak256 } from "@latticexyz/utils";

export default function Increment() {
  const network = useMud();

  const counter = Counter.use();
  const doubleCounter = DoubleCounter.use();
  const debug = IsDebug.use();
  return (
    <div className="flex flex-col text-white">
      <div className="h-20">
        Is Debug: <span>{`${debug?.value}` ?? "??"}</span>
        <br />
        Counter: <span>{counter?.value ?? "??"}</span>
        <br />
        Double Counter!: <span>{doubleCounter?.value ?? "??"}</span>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          increment(SingletonID, network);
        }}
      >
        Increment
      </button>

      <SavePrimodium />
      <ImageGrid />
    </div>
  );
}
// drone factory level 3 required resources:
// resourceValues[0] = ResourceValue({ resource: SulfurResourceItemID, value: 275000 });
// resourceValues[1] = ResourceValue({ resource: KimberliteResourceItemID, value: 10000 });

async function executeContractFunction() {
  const privateKey =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const contractId = P_RequiredResources.metadata.contractId;
  const config = getNetworkLayerConfig();
  const provider = new ethers.providers.JsonRpcProvider(
    config.provider.jsonRpcUrl
  );
  const wallet = new ethers.Wallet(privateKey, provider);

  const worldAddress = getNetworkLayerConfig().worldAddress;
  const world = new ethers.Contract(worldAddress, World.abi, wallet);

  const componentAddress = await world.getComponent(keccak256(contractId));

  const abi = P_RequiredResourcesJson.abi;
  const component = new ethers.Contract(componentAddress, abi, wallet);

  let contractWithSigner = component.connect(wallet);

  const entityID = hashKeyEntity(BlockType.Workshop, 3);
  const resources = [BlockType.Sulfur, BlockType.Kimberlite];
  const values = [275000, 10000];

  const resourceValues: ResourceValuesStruct = {
    resources,
    values,
  };

  const tx = await contractWithSigner["set(uint256,(uint256[],uint32[]))"](
    entityID,
    resourceValues
  );

  await tx.wait();

  return tx.hash;
}

const SavePrimodium = () => {
  return <button onClick={executeContractFunction}>SAVE PRIMODIUM</button>;
};

const ImageGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "background" | "resource" | "research"
  >("background");

  const images = useMemo(() => {
    if (activeTab == "background") return [...BackgroundImage.entries()];
    if (activeTab == "resource") return [...ResourceImage.entries()];
    return [...ResearchImage.entries()];
  }, [activeTab]);
  console.log(images);

  return (
    <div className="text-black w-full h-full p-4 z-10 bg-white overflow-auto">
      <div className="mb-4 border-b-2">
        <h1>Resource Assets</h1>
        <button
          className={`px-4 py-2 ${
            activeTab === "background" ? "border-b-2 border-blue-600" : ""
          }`}
          onClick={() => setActiveTab("background")}
        >
          Background
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "resource" ? "border-b-2 border-blue-600" : ""
          }`}
          onClick={() => setActiveTab("resource")}
        >
          Resource
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "research" ? "border-b-2 border-blue-600" : ""
          }`}
          onClick={() => setActiveTab("research")}
        >
          Research
        </button>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {images.map(([name, uri], index) => (
          <Fragment key={`${activeTab}-${index}`}>
            <p>{getBlockTypeName(name)}</p>
            <img
              key={index}
              src={uri[0]}
              alt={`Image ${getBlockTypeName(name)}`}
              className="w-40 h-40 object-cover shadow-md"
            />
          </Fragment>
        ))}
      </div>
    </div>
  );
};
