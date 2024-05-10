import { PushButton } from "@/components/core/PushButton";
import { useMud } from "@/hooks";
import { useTransfer } from "@/hooks/providers/TransferProvider";
import { createFleet } from "@/network/setup/contractCalls/createFleet";
import { transfer } from "@/network/setup/contractCalls/fleetTransfer";
import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { useMemo } from "react";
import { toast } from "react-toastify";
import { components } from "src/network/components";
import { getEntityTypeName } from "src/util/common";
import { ResourceEntityLookup, UtilityStorages } from "src/util/constants";
import { getFullResourceCount } from "src/util/resource";
import { getFleetStatsFromUnits } from "src/util/unit";
import { Hex } from "viem";
interface TransferConfirmProps {
  rightUnits: Map<Entity, bigint>;
  rightResources: Map<Entity, bigint>;
}

export const TransferConfirm = (props: {
  leftUnits: Map<Entity, bigint>;
  leftResources: Map<Entity, bigint>;
  rightUnits: Map<Entity, bigint>;
  rightResources: Map<Entity, bigint>;
}) => {
  const { left, right, deltas, setDeltas } = useTransfer();
  const mud = useMud();
  const leftIsFleet = components.IsFleet.has(left);
  const rightIsFleet = right === "newFleet" || components.IsFleet.has(right);

  const handleSubmit = () => {
    if (!left || !right) return;
    if (right === "newFleet") createFleet(mud, left, deltas);
    else transfer(mud, left, right, deltas);
    setDeltas(new Map());
  };

  const { disabled, submitMessage } = useMemo(() => {
    if (!left || !right) return { disabled: true, submitMessage: "Transfer" };
    if (!leftIsFleet) return { disabled: false, submitMessage: "Transfer" };
    const owner = (left !== "newFleet" ? components.OwnedBy.get(left)?.value : undefined) as Entity | undefined;
    const cargo = getFleetStatsFromUnits(props.leftUnits, owner).cargo;
    if (cargo < [...props.leftResources.entries()].reduce((acc, [, count]) => acc + count, 0n))
      return { disabled: true, submitMessage: "Sender cargo capacity exceeded" };
    return { disabled: false, submitMessage: "Transfer" };
  }, [leftIsFleet, left, props.leftUnits, props.leftResources]);

  if (disabled) return <TransferConfirmButton disabled={disabled} message={submitMessage} onClick={handleSubmit} />;
  return rightIsFleet || right === "newFleet" ? (
    <TransferConfirmFleet entity={right!} {...props} />
  ) : (
    <TransferConfirmAsteroid entity={right as Entity} {...props} />
  );
};

const TransferConfirmButton = ({
  disabled,
  message,
  onClick,
}: {
  disabled?: boolean;
  message: string;
  onClick?: () => void;
}) => (
  <PushButton variant="primary" size="md" className="w-full" disabled={disabled} onClick={onClick}>
    {message}
  </PushButton>
);

const TransferConfirmFleet = ({
  rightUnits,
  rightResources,
  entity,
}: TransferConfirmProps & { entity: Entity | "newFleet" }) => {
  const { left, deltas, setDeltas } = useTransfer();
  const mud = useMud();
  const handleSubmit = () => {
    if (!left) return;
    if (entity === "newFleet") createFleet(mud, left, deltas);
    else transfer(mud, left, entity, deltas);
    setDeltas(new Map());
  };

  const owner = (entity !== "newFleet" ? components.OwnedBy.get(entity)?.value : undefined) as Entity | undefined;
  const { disabled, submitMessage } = useMemo(() => {
    const newFleet = entity === "newFleet";
    const rightCargo = getFleetStatsFromUnits(rightUnits, owner).cargo;
    if (rightCargo < [...rightResources.entries()].reduce((acc, [, count]) => acc + count, 0n)) {
      toast.info("Sender cargo capacity exceeded");
      return { disabled: true, submitMessage: "Transfer" };
    }
    // const fromCargo = getFleetStatsFromUnits(fromUnits, owner).cargo;
    // if (fromCargo < [...fromResources.entries()].reduce((acc, [, count]) => acc + count, 0n)) {
    //   toast.info("Sender cargo capacity exceeded");
    //   return { disabled: true, submitMessage: "Transfer" };
    // }

    return { disabled: false, submitMessage: newFleet ? "Create Fleet" : "Transfer" };
  }, [rightUnits, entity, rightResources, owner]);

  return <TransferConfirmButton disabled={disabled} message={submitMessage} onClick={handleSubmit} />;
};

const TransferConfirmAsteroid = ({ entity, rightUnits, rightResources }: TransferConfirmProps & { entity: Entity }) => {
  const mud = useMud();
  const { left, right, deltas, setDeltas } = useTransfer();
  const handleSubmit = () => {
    if (!left || !right) return;
    if (right === "newFleet") createFleet(mud, left, deltas);
    else transfer(mud, left, right, deltas);
    setDeltas(new Map());
  };

  const { disabled, submitMessage } = useMemo(() => {
    // make sure we have enough storage for housing
    const utilitiesUsed = [...rightUnits.entries()].reduce((acc, [unit, count]) => {
      const level = components.UnitLevel.getWithKeys({ unit: unit as Hex, entity: entity as Hex })?.value ?? 0n;
      const requiredResources = components.P_RequiredResources.getWithKeys({ prototype: unit as Hex, level });
      if (!requiredResources) return acc;
      requiredResources.resources.forEach((rawResource, i) => {
        const resource = ResourceEntityLookup[rawResource as EResource];
        if (!UtilityStorages.has(resource)) return;
        const amount = requiredResources.amounts[i] * count;
        acc[resource] ? (acc[resource] += amount) : (acc[resource] = amount);
      });
      return acc;
    }, {} as Record<Entity, bigint>);

    const enoughUtilities = Object.entries(utilitiesUsed).find(([resource, count]) => {
      const { resourceStorage } = getFullResourceCount(resource as Entity, entity);
      return count > resourceStorage;
    });

    if (enoughUtilities)
      return { disabled: true, submitMessage: `Not enough ${getEntityTypeName(enoughUtilities[0] as Entity)} storage` };

    // make sure we have enough storage for resources
    const enoughResources = [...rightResources.entries()].find(([resource, count]) => {
      const { resourceStorage } = getFullResourceCount(resource as Entity, entity);
      return count > resourceStorage;
    });
    if (enoughResources)
      return { disabled: true, submitMessage: `Not enough ${getEntityTypeName(enoughResources[0] as Entity)} storage` };
    return { disabled: false, submitMessage: "Transfer" };
  }, [rightUnits, rightResources, entity]);

  return <TransferConfirmButton disabled={disabled} message={submitMessage} onClick={handleSubmit} />;
};
