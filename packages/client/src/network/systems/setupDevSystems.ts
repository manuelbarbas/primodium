import { TxQueue } from "@latticexyz/network";
import {
  Component,
  ComponentValue,
  defineComponent,
  EntityID,
  EntityIndex,
  Schema,
  Type,
  World,
} from "@latticexyz/recs";
import { keccak256 } from "@latticexyz/utils";
import { BigNumber } from "ethers";
import { SystemTypes } from "../../../../contracts/types/SystemTypes";

function setupDevSystems(
  world: World,
  encodersPromise: Promise<
    Record<string, (value: { [key: string]: unknown }) => string>
  >,
  systems: TxQueue<SystemTypes>
) {
  const DevHighlightComponent = defineComponent(world, {
    value: Type.OptionalNumber,
  });

  const HoverHighlightComponent = defineComponent(world, {
    x: Type.OptionalNumber,
    y: Type.OptionalNumber,
  });

  async function setEntityContractComponentValue<T extends Schema>(
    entityId: EntityID,
    component: Component<T, { contractId: string }>,
    newValue: ComponentValue<T>
  ) {
    if (!component.metadata.contractId) {
      const errmsg = `Attempted to set the contract value of Component ${component.id} without a deployed contract backing it.`;

      throw new Error(errmsg);
    }
    const encoders = await encodersPromise;
    const contractHash = keccak256(component.metadata.contractId);
    const data = encoders[contractHash](newValue);
    console.log(
      `Sent transaction to edit networked Component ${component.id} for Entity ${entityId} to value `,
      newValue
    );
    await systems["system.ComponentDev"].executeTyped(
      contractHash,
      BigNumber.from(entityId),
      data
    );
  }

  async function setContractComponentValue<T extends Schema>(
    entity: EntityIndex,
    component: Component<T, { contractId: string }>,
    newValue: ComponentValue<T>
  ) {
    setEntityContractComponentValue(
      world.entities[entity],
      component,
      newValue
    );
  }

  return {
    setEntityContractComponentValue,
    setContractComponentValue,
    DevHighlightComponent,
    HoverHighlightComponent,
  };
}

export default setupDevSystems;
