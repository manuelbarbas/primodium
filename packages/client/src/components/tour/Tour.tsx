import { Walktour } from "walktour";
import { useTourStore } from "../../store/TourStore";
import { steps } from "./Steps";
import { useGameStore } from "../../store/GameStore";
import NarrationBox from "./NarrationBox";
import { _TourHintLayer } from "../../map-components/TourHintLayer";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export const Tour = () => {
  const map = useMap();
  const [
    currentStep,
    setCurrentStep,
    setCompletedTutorial,
    completedTutorial,
    checkpoint,
    setCheckpoint,
    spawn,
  ] = useTourStore((state) => [
    state.currentStep,
    state.setCurrentStep,
    state.setCompletedTutorial,
    state.completedTutorial,
    state.checkpoint,
    state.setCheckpoint,
    state.spawn,
  ]);

  const [setGameStateToDefault, setSelectedTile, setShowUI] = useGameStore(
    (state) => [
      state.setGameStateToDefault,
      state.setSelectedTile,
      state.setShowUI,
    ]
  );

  useEffect(() => {
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
    setSelectedTile(spawn);
    map.setView([spawn.y, spawn.x]);
  }, []);

  //hide ui if step specifies
  useEffect(() => {
    console.log(currentStep);
    if (!currentStep) {
      setShowUI(false);
      return;
    }

    setShowUI(!currentStep.hideUI);
  }, [currentStep]);

  if (completedTutorial) return null;

  return (
    <div className=" pointer-events-none">
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
