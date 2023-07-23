import { useEffect, useState } from "react";
import { Walktour } from "walktour";

import buildTourSteps from "./Steps";
import NarrationBox from "./NarrationBox";
import { useTourStore } from "../../store/TourStore";
import { useGameStore } from "../../store/GameStore";
import { useMud } from "../../context/MudContext";
import { TourStep } from "../../util/types";
import { useAccount } from "../../hooks/useAccount";
import { validTutorialClick } from "src/util/tutorial";
import { Marker, SelectedTile } from "src/network/components/clientComponents";

export const Tour = () => {
  const mudCtx = useMud();
  // const account = useAccount();
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [
    currentStep,
    setCurrentStep,
    setCompletedTutorial,
    checkpoint,
    setCheckpoint,
  ] = useTourStore((state) => [
    state.currentStep,
    state.setCurrentStep,
    state.setCompletedTutorial,
    state.checkpoint,
    state.setCheckpoint,
  ]);

  const [setGameStateToDefault, setShowUI] = useGameStore((state) => [
    state.setGameStateToDefault,
    state.setShowUI,
  ]);

  const { address } = useAccount();

  //instatiate steps with injected mud context, set current step to checkpoint + 1, set map view to random spawn
  useEffect(() => {
    const steps = buildTourSteps(mudCtx, address);
    setSteps(steps);

    //set the current step to saved checkpoint + 1
    setCurrentStep(
      checkpoint
        ? steps[
            steps.findIndex(
              (step) => step.description === checkpoint.description
            ) + 1
          ]
        : null
    );
  }, []);

  //hide ui if step specifies
  useEffect(() => {
    if (!currentStep) {
      setShowUI(false);
      return;
    }

    setShowUI(!currentStep.hideUI);
    Marker.clear();
  }, [currentStep]);

  //steps needs to be defined for initialStepIndex to work
  if (!steps.length) return null;

  return (
    <div>
      <div className="absolute top-0 left-0 z-[1001] ml-4">
        <NarrationBox />
      </div>
      <Walktour
        steps={steps}
        zIndex={1000}
        initialStepIndex={
          checkpoint
            ? steps.findIndex(
                (step) => step.description == checkpoint.description
              ) + 1
            : 0
        }
        disableCloseOnClick
        maskRadius={10}
        disableClose
        disableNext
        disablePrev
        movingTarget
        validateNextOnTargetClick={async () => {
          const selectedTile = SelectedTile.get();

          if (!selectedTile) return false;

          return validTutorialClick(selectedTile);
        }}
        customCloseFunc={(tourLogic) => {
          setCheckpoint(null);
          setCompletedTutorial(true);
          setGameStateToDefault();
          tourLogic.close();
        }}
        updateInterval={10}
        rootSelector="#game-container"
        key="hints"
      />
    </div>
  );
};
