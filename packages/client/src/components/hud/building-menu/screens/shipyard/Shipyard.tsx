import { Modal } from "@/components/core/Modal";
import { Upgrade } from "@/components/hud/building-menu/widgets/Upgrade";
import { CommissionColonyShips } from "@/components/hud/modals/colony-ships/CommissionColonyShips";
import { usePrimodium } from "@/hooks/usePrimodium";
import { getBuildingImage } from "@/util/building";
import { EntityType, ResourceImage } from "@/util/constants";
import { Entity } from "@latticexyz/recs";
import { FaInfoCircle } from "react-icons/fa";
import { Navigator } from "src/components/core/Navigator";

export const Shipyard: React.FC<{ building: Entity }> = ({ building }) => {
  // const info = useBuildingInfo(building);
  const primodium = usePrimodium();
  const buildingImage = getBuildingImage(primodium, building);

  return (
    <Navigator.Screen title={building} className="px-4 py-2 gap-2">
      <div className="flex gap-2">
        <img src={buildingImage} className="h-10" />
        <div className="flex flex-col">
          <div className="flex items-center justify-center">
            Shipyard
            <Navigator.NavButton to="BuildingInfo" className="btn-xs btn-ghost flex gap-2 w-fit opacity-75">
              <FaInfoCircle />
            </Navigator.NavButton>
          </div>
          {/* <p className="opacity-50 text-xs">Level {info.level.toString()}</p> */}
        </div>
      </div>

      <Upgrade building={building} />
      <Modal title="Colony Ships">
        <Modal.Button variant="primary" size="md">
          <img
            src={ResourceImage.get(EntityType.ColonyShip) ?? ""}
            className={`pixel-image text-lg w-[1em] scale-150`}
          />
          <span className="w-fit px-2 text-xs">Commission Colony Ships</span>
        </Modal.Button>
        <Modal.Content className="flex">
          <CommissionColonyShips buildingEntity={building} />
        </Modal.Content>
      </Modal>
    </Navigator.Screen>
  );
};
