import { useEntityQuery } from "@latticexyz/react";
import { Has, HasValue } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { FaPlus } from "react-icons/fa";
import { Badge } from "src/components/core/Badge";
import { Navigator } from "src/components/core/Navigator";
import { components } from "src/network/components";
import { FleetButton } from "../../modals/fleets/FleetButton";

export const FriendlyFleets: React.FC = () => {
  const selectedRock = components.SelectedRock.use()?.value ?? singletonEntity;

  const query = [Has(components.IsFleet), HasValue(components.OwnedBy, { value: selectedRock })];
  const friendlyFleets = useEntityQuery(query);
  // const maxFleets =
  //   components.ResourceCount.getWithKeys({ entity: selectedRock as Hex, resource: EResource.U_MaxMoves })?.value ?? 0n;

  const maxFleets = 3n;
  return (
    <div className="flex flex-col gap-2 p-2">
      <Badge className="border border-secondary/50 text-xs font-bold uppercase p-2 self-end">
        {maxFleets.toString()} Fleet{maxFleets == 1n ? "" : "s"} Available
      </Badge>
      <div className="w-full text-xs overflow-y-auto grid grid-cols-2 gap-2">
        {friendlyFleets.length === 0
          ? null
          : friendlyFleets.map((entity) => {
              const fleet = components.FleetMovement.get(entity);

              if (!fleet) return null;

              return <FleetButton key={entity} fleetEntity={entity} />;
            })}

        {new Array(Number(maxFleets)).fill(0).map((_, index) => (
          <Navigator.NavButton
            key={`newFleet-${index}`}
            to="CreateFleet"
            className="btn-primary grid place-items-center w-full h-full"
          >
            <FaPlus className="h-full" />
          </Navigator.NavButton>
        ))}
      </div>
    </div>
  );
};
