import { Walktour } from "walktour";
import { useTourStore } from "../../store/TourStore";
import { steps } from "./Steps";
import { useGameStore } from "../../store/GameStore";
import NarrationBox from "./NarrationBox";

export const Tour = () => {
  const [currStep, setCurrStep, setCompletedTutorial, completedTutorial] =
    useTourStore((state) => [
      state.currStep,
      state.setCurrStep,
      state.setCompletedTutorial,
      state.completedTutorial,
    ]);

  const [setGameStateToDefault] = useGameStore((state) => [
    state.setGameStateToDefault,
  ]);

  //do not render if completed tutorial
  if (completedTutorial) return null;

  return (
    <>
      {/* narration box only happens on step 1 as step 0 is the intro */}
      {currStep !== 0 && (
        <div className="absolute top-0 left-0 z-[1001] ml-4">
          <NarrationBox />
        </div>
      )}
      <Walktour
        identifier="hints"
        steps={steps}
        zIndex={1000}
        // initialStepIndex={currStep}
        maskRadius={10}
        movingTarget
        customNextFunc={(tourLogic) => {
          setCurrStep(tourLogic.stepIndex + 1);
          tourLogic.next();
        }}
        customCloseFunc={(tourLogic) => {
          setCurrStep(0);
          setCompletedTutorial(true);
          setGameStateToDefault();
          tourLogic.close();
        }}
        updateInterval={10}
        key="hints"
        rootSelector=".screen-container"
      />
    </>
  );
};
