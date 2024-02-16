import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { useMemo } from "react";
import { Button } from "src/components/core/Button";
import { components } from "src/network/components";
import { ResourceEntityLookup, UtilityStorages } from "src/util/constants";
import { getFullResourceCount } from "src/util/resource";
import { getFleetStatsFromUnits } from "src/util/unit";
import { Hex } from "viem";

interface TransferConfirmProps {
  entity: Entity | "newFleet";
  handleSubmit: () => void;
  toUnits: Map<Entity, bigint>;
  toResources: Map<Entity, bigint>;
}

const TransferConfirm = ({
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

export const TransferConfirmFleet = ({ toUnits, toResources, handleSubmit, entity }: TransferConfirmProps) => {
  const { disabled, submitMessage } = useMemo(() => {
    const newFleet = entity === "newFleet";
    if (toUnits.size === 0) return { disabled: true, submitMessage: "Add Units" };

    const cargo = getFleetStatsFromUnits(toUnits).cargo;
    if (cargo < [...toResources.entries()].reduce((acc, [, count]) => acc + count, 0n))
      return { disabled: true, submitMessage: "Cargo capacity exceeded" };

    return { disabled: false, submitMessage: newFleet ? "Create Fleet" : "Transfer" };
  }, [toUnits, entity, toResources]);

  return <TransferConfirm disabled={disabled} message={submitMessage} onClick={handleSubmit} />;
};

export const TransferConfirmAsteroid = ({ entity, toUnits, toResources, handleSubmit }: TransferConfirmProps) => {
  const { disabled, submitMessage } = useMemo(() => {
    if (entity == "newFleet") return { disabled: true, submitMessage: "Create Fleet" };
    if (toUnits.size === 0) return { disabled: true, submitMessage: "Transfer" };

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

    const enoughUtilities = Object.entries(utilitiesUsed).every(([resource, amount]) => {
      const { resourceStorage } = getFullResourceCount(resource as Entity, entity);
      if (amount > resourceStorage) return false;
    });
    if (!enoughUtilities) return { disabled: true, submitMessage: "Not enough storage" };

    // make sure we have enough storage for resources
    const enoughResources = [...toResources.entries()].every(([resource, count]) => {
      const { resourceStorage } = getFullResourceCount(resource as Entity, entity);
      if (count > resourceStorage) return false;
    });
    if (!enoughResources) return { disabled: true, submitMessage: "Not enough resource storage" };
    return { disabled: false, submitMessage: "Transfer" };
  }, [toUnits, toResources, entity]);

  return <TransferConfirm disabled={disabled} message={submitMessage} onClick={handleSubmit} />;
};
