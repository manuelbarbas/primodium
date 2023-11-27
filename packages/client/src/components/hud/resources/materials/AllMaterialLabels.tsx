import { SecondaryCard } from "src/components/core/Card";
import { EntityType, ResourceEntityLookup } from "src/util/constants";
import { MaterialLabel } from "./MaterialLabel";
import { usePlayerFullResourceCount } from "src/hooks/useFullResourceCount";
import { useMud } from "src/hooks";
import { getBlockTypeName } from "src/util/common";
import { EResource, MUDEnums } from "contracts/config/enums";
import { Account } from "src/network/components/clientComponents";
import { components } from "src/network/components";
import { singletonEntity } from "@latticexyz/store-sync/recs";

export const AllMaterialLabels = () => {
  const playerEntity = Account.get()?.value ?? singletonEntity;
  const playerFullResourceCount = usePlayerFullResourceCount(playerEntity);

  return (
    <SecondaryCard className="grid grid-cols-1 gap-1">
      {playerFullResourceCount.map((fullResourceCount, index) => {
        return (
          index > 0 &&
          index < MUDEnums.EResource.length &&
          fullResourceCount &&
          (fullResourceCount?.resourceStorage ?? 0n) > 0n &&
          !components.P_IsUtility.getWithKeys({ id: index as EResource })?.value && (
            <MaterialLabel
              name={getBlockTypeName(ResourceEntityLookup[index as EResource])}
              resource={ResourceEntityLookup[index as EResource]}
              maxStorage={fullResourceCount?.resourceStorage ?? 0n}
              resourceCount={fullResourceCount?.resourceCount ?? 0n}
              resourcesToClaim={fullResourceCount?.resourcesToClaim ?? 0n}
              production={fullResourceCount?.production ?? 0n}
            />
          )
        );
      })}
    </SecondaryCard>
  );
};
