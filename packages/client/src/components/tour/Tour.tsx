import { Walktour } from "walktour";
import { useTourStore } from "../../store/TourStore";
import buildTourSteps from "./Steps";
import { useGameStore } from "../../store/GameStore";
import NarrationBox from "./NarrationBox";
import { _TourHintLayer } from "../../map-components/TourHintLayer";
import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import { validMapClick } from "../../util/map";
import { useMud } from "../../context/MudContext";
import { TourStep } from "../../util/types";
import { useAccount } from "../../hooks/useAccount";

export const Tour = () => {
  const map = useMap();
  const mudCtx = useMud();
  // const account = useAccount();
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [
    currentStep,
    setCurrentStep,
    setCompletedTutorial,
    checkpoint,
    setCheckpoint,
    spawn,
  ] = useTourStore((state) => [
    state.currentStep,
    state.setCurrentStep,
    state.setCompletedTutorial,
    state.checkpoint,
    state.setCheckpoint,
    state.spawn,
  ]);

  const [setGameStateToDefault, setShowUI] = useGameStore((state) => [
    state.setGameStateToDefault,
    state.setShowUI,
  ]);

  //instatiate steps with injected mud context
  useEffect(() => {
    setSteps(buildTourSteps(mudCtx));
  }, []);

  useEffect(() => {
    if (!steps) return;

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

    if (!spawn) return;

    //we want to default to the spawn tile when tour is in progress
    map.setView([spawn.y, spawn.x]);
  }, [steps]);

  //hide ui if step specifies
  useEffect(() => {
    if (!currentStep) {
      setShowUI(false);
      return;
    }

    setShowUI(!currentStep.hideUI);
  }, [currentStep]);

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
        debug
        disableNext
        disablePrev
        movingTarget
        customPrevFunc={(tourLogic) => {
          //wipe map hints
          _TourHintLayer.clearLayers();

          tourLogic.prev();
        }}
        customNextFunc={(tourLogic) => {
          //wipe map hints
          _TourHintLayer.clearLayers();

          tourLogic.next();
        }}
        validateNextOnTargetClick={async () => {
          const selectedTile = useGameStore.getState().selectedTile;

          return validMapClick(selectedTile);
        }}
        customCloseFunc={(tourLogic) => {
          setCheckpoint(null);
          setCompletedTutorial(true);
          setGameStateToDefault();
          tourLogic.close();
        }}
        updateInterval={10}
        key="hints"
        rootSelector=".screen-container"
      />
    </div>
  );
};
