import { useMud } from "@/hooks";
import { useTransfer } from "@/hooks/providers/TransferProvider";
import { createFleet } from "@/network/setup/contractCalls/createFleet";
import { transfer } from "@/network/setup/contractCalls/fleetTransfer";
import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { useMemo } from "react";
import { Button } from "src/components/core/Button";
import { components } from "src/network/components";
import { getEntityTypeName } from "src/util/common";
import { ResourceEntityLookup, UtilityStorages } from "src/util/constants";
import { getFullResourceCount } from "src/util/resource";
import { getFleetStatsFromUnits } from "src/util/unit";
import { Hex } from "viem";

interface TransferConfirmProps {
  toUnits: Map<Entity, bigint>;
  toResources: Map<Entity, bigint>;
}

export const TransferConfirm = (props: {
  toUnits: Map<Entity, bigint>;
  toResources: Map<Entity, bigint>;
  fromUnits: Map<Entity, bigint>;
  fromResources: Map<Entity, bigint>;
}) => {
  const { from, to, deltas, setDeltas } = useTransfer();
  const mud = useMud();
  const fromIsFleet = components.IsFleet.has(from);
  const toIsFleet = to === "newFleet" || components.IsFleet.has(to);

  const handleSubmit = () => {
    if (!from || !to) return;
    if (to === "newFleet") createFleet(mud, from, deltas);
    else transfer(mud, from, to, deltas);
    setDeltas(new Map());
  };

  const { disabled, submitMessage } = useMemo(() => {
    if (!fromIsFleet) return { disabled: false, submitMessage: "Transfer" };
    const owner = (from !== "newFleet" ? components.OwnedBy.get(from)?.value : undefined) as Entity | undefined;
    const cargo = getFleetStatsFromUnits(props.fromUnits, owner).cargo;
    if (cargo < [...props.fromResources.entries()].reduce((acc, [, count]) => acc + count, 0n))
      return { disabled: true, submitMessage: "Sender cargo capacity exceeded" };
    return { disabled: false, submitMessage: "Transfer" };
  }, [fromIsFleet, from, props.fromUnits, props.fromResources]);

  if (disabled) return <TransferConfirmButton disabled={disabled} message={submitMessage} onClick={handleSubmit} />;
  return toIsFleet || to === "newFleet" ? (
    <TransferConfirmFleet entity={to!} {...props} />
  ) : (
    <TransferConfirmAsteroid entity={to as Entity} {...props} />
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
  <Button className="btn-primary w-48" disabled={disabled} onClick={onClick}>
    {message}
  </Button>
);

const TransferConfirmFleet = ({
  toUnits,
  toResources,
  entity,
}: TransferConfirmProps & { entity: Entity | "newFleet" }) => {
  const { from, deltas, setDeltas } = useTransfer();
  const mud = useMud();
  const handleSubmit = () => {
    if (!from) return;
    if (entity === "newFleet") createFleet(mud, from, deltas);
    else transfer(mud, from, entity, deltas);
    setDeltas(new Map());
  };

  const owner = (entity !== "newFleet" ? components.OwnedBy.get(entity)?.value : undefined) as Entity | undefined;
  const { disabled, submitMessage } = useMemo(() => {
    const newFleet = entity === "newFleet";
    if (toUnits.size === 0) return { disabled: true, submitMessage: "Add Units" };

    const cargo = getFleetStatsFromUnits(toUnits, owner).cargo;
    if (cargo < [...toResources.entries()].reduce((acc, [, count]) => acc + count, 0n))
      return { disabled: true, submitMessage: "Recipient cargo exceeded" };

    return { disabled: false, submitMessage: newFleet ? "Create Fleet" : "Transfer" };
  }, [toUnits, entity, toResources, owner]);

  return <TransferConfirmButton disabled={disabled} message={submitMessage} onClick={handleSubmit} />;
};

const TransferConfirmAsteroid = ({ entity, toUnits, toResources }: TransferConfirmProps & { entity: Entity }) => {
  const mud = useMud();
  const { from, to, deltas, setDeltas } = useTransfer();
  const handleSubmit = () => {
    if (!from || !to) return;
    if (to === "newFleet") createFleet(mud, from, deltas);
    else transfer(mud, from, to, deltas);
    setDeltas(new Map());
  };

  const { disabled, submitMessage } = useMemo(() => {
    // make sure we have enough storage for housing
    const utilitiesUsed = [...toUnits.entries()].reduce((acc, [unit, count]) => {
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
    const enoughResources = [...toResources.entries()].find(([resource, count]) => {
      const { resourceStorage } = getFullResourceCount(resource as Entity, entity);
      return count > resourceStorage;
    });
    if (enoughResources)
      return { disabled: true, submitMessage: `Not enough ${getEntityTypeName(enoughResources[0] as Entity)} storage` };
    return { disabled: false, submitMessage: "Transfer" };
  }, [toUnits, toResources, entity]);

  return <TransferConfirmButton disabled={disabled} message={submitMessage} onClick={handleSubmit} />;
};
