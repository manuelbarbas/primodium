import { EResource } from "contracts/config/enums";
import { FaPlus } from "react-icons/fa";
import { Badge } from "src/components/core/Badge";
import { useOrbitingFleets } from "src/hooks/useOrbitingFleets";
import { components } from "src/network/components";
import { Hex } from "viem";
import { FleetButton } from "../../global/modals/fleets/FleetButton";
import { useFleetNav } from "./Fleets";

export const FriendlyFleets: React.FC = () => {
  const selectedRock = components.ActiveRock.use()?.value;
  if (!selectedRock) throw new Error("No rock selected");
  const Nav = useFleetNav();

  const friendlyFleets = useOrbitingFleets(selectedRock);
  const maxFleets =
    components.ResourceCount.getWithKeys({ entity: selectedRock as Hex, resource: EResource.U_MaxFleets })?.value ?? 0n;

  return (
    <div className="flex flex-col gap-2 p-2">
      <Badge className="border border-secondary/50 text-xs font-bold uppercase p-2 self-end">
        {maxFleets.toString()} Fleet{maxFleets == 1n ? "" : "s"} Available
      </Badge>
      <div className="w-full text-xs overflow-y-auto grid grid-cols-2 gap-2">
        {friendlyFleets.length === 0
          ? null
          : friendlyFleets.map((fleetEntity) => {
              const fleet = components.FleetMovement.get(fleetEntity);

              if (!fleet) return null;

              return (
                <FleetButton
                  key={fleetEntity}
                  fleetEntity={fleetEntity}
                  onClick={() => Nav.navigateTo("manageFleet", { fleetEntity })}
                />
              );
            })}

        {new Array(Number(maxFleets)).fill(0).map((_, index) => (
          <Nav.NavButton
            key={`newFleet-${index}`}
            goto="createFleet"
            className="btn-primary grid place-items-center w-full h-full"
          >
            <FaPlus className="h-full" />
          </Nav.NavButton>
        ))}
      </div>
    </div>
  );
};
