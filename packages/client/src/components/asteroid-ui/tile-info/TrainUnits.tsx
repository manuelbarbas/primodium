import { EntityID } from "@latticexyz/recs";
import { useState } from "react";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import { GameButton } from "src/components/shared/GameButton";
import PortalModal from "src/components/shared/PortalModal";
import { MaxUtility } from "src/network/components/chainComponents";
import { Account } from "src/network/components/clientComponents";
import { BlockType } from "src/util/constants";
import { hashKeyEntity } from "src/util/encode";
import { useTrainableUnits } from "src/util/trainUnits";
import { TrainingProgress } from "./TrainingProgress";
import { UnitTraining } from "./UnitTraining";

export const TrainUnits: React.FC<{ buildingEntity: EntityID }> = ({ buildingEntity }) => {
  const [show, setShow] = useState(false);
  const [showTrainModal, setShowTrainModal] = useState(false);
  const account = Account.use(undefined, { value: "0" as EntityID }).value;

  const playerResourceEntity = hashKeyEntity(BlockType.HousingUtilityResource, account);

  const maximum = MaxUtility.use(playerResourceEntity, { value: 0 }).value;
  const trainableUnits = useTrainableUnits(buildingEntity);

  if (trainableUnits.length == 0 || maximum == 0) return null;
  return (
    <div className="">
      <GameButton className="w-44" depth={6} color="bg-orange-500" onClick={() => setShowTrainModal(true)}>
        <p className="px-2 p-1 text-sm font-bold">Train Units</p>
      </GameButton>
      <PortalModal title="Train Units" show={showTrainModal} onClose={() => setShowTrainModal(false)}>
        <div className="flex flex-col w-96 items-center p-4 space-y-4">
          {show && <UnitTraining buildingEntity={buildingEntity} onClose={() => setShow(false)} />}
          {!show && (
            <div className="w-full">
              <div className="w-full">
                <TrainingProgress buildingEntity={buildingEntity} />
              </div>
            </div>
          )}
          <hr className="w-full border-t border-cyan-800" />
          <button
            className={`p-1 px-4 border rounded-md  gap-2 flex items-center text-md font-bold 
              ${
                show
                  ? "border-slate-900 bg-slate-600 bg-gradient-to-b from-transparent to-slate-900/30"
                  : "border-cyan-600 bg-cyan-600 bg-gradient-to-b from-transparent to-cyan-900/30"
              }
            `}
            onClick={() => setShow(!show)}
          >
            {!show && (
              <>
                <FaPlus /> ADD TRAINING ORDER
              </>
            )}
            {show && (
              <>
                <FaArrowLeft /> Back
              </>
            )}
          </button>
        </div>
      </PortalModal>
    </div>
  );
};
